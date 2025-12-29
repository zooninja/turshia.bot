# TURSHIA.BOT Architecture

System architecture and data flow documentation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Vite)                                 │ │
│  │  - Chat UI                                             │ │
│  │  - localStorage persistence                            │ │
│  │  - Mode toggle (soft/snappy)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────┘
                 │ POST /api/chat
                 │ { messages, mode }
                 ▼
┌─────────────────────────────────────────────────────────────┐
│               Cloudflare Pages Functions                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Handler (chat.ts)                                 │ │
│  │  1. Rate limiting check (KV)                           │ │
│  │  2. Input validation                                   │ │
│  │  3. Message trimming (last 12 turns)                   │ │
│  │  4. Prompt engineering                                 │ │
│  │  5. LLM provider call                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────┬──────────────────────────────────────────┬───────────┘
       │                                          │
       │ Read/Write                               │ API Call
       ▼                                          ▼
┌──────────────────┐              ┌──────────────────────────┐
│ Cloudflare KV    │              │   LLM Provider           │
│                  │              │   ┌──────────────────┐   │
│ Rate limit data  │              │   │  Gemini API      │   │
│ rl:<ip>:<time>   │              │   │  (or Groq API)   │   │
│                  │              │   └──────────────────┘   │
└──────────────────┘              └──────────────────────────┘
```

## Request Flow

### 1. User Interaction
```
User types message
    ↓
React validates input (non-empty)
    ↓
Add to local message array
    ↓
Save to localStorage
    ↓
POST to /api/chat
```

### 2. API Processing
```
Receive POST /api/chat
    ↓
Extract CF-Connecting-IP
    ↓
Check rate limit (KV lookup)
    ↓
    ├─ Over limit → 429 response
    ↓
    └─ Within limit → Continue
         ↓
    Validate request body
         ↓
         ├─ Invalid → 400 response
         ↓
         └─ Valid → Continue
              ↓
         Trim to last 12 messages
              ↓
         Build system prompt (with mode)
              ↓
         Call LLM provider
              ↓
              ├─ Error → 502 response
              ↓
              └─ Success → 200 with reply
```

### 3. Response Handling
```
Receive response
    ↓
Parse JSON
    ↓
    ├─ Error → Display error message
    ↓
    └─ Success → Continue
         ↓
    Add assistant message to array
         ↓
    Save to localStorage
         ↓
    Display in UI
         ↓
    Scroll to bottom
```

## Component Architecture

### Frontend Components

```
App (App.tsx)
├── State Management
│   ├── messages: Message[]
│   ├── input: string
│   ├── mode: 'soft' | 'snappy'
│   ├── loading: boolean
│   └── error: string | null
│
├── Effects
│   ├── Load from localStorage (mount)
│   ├── Save to localStorage (messages change)
│   ├── Save mode (mode change)
│   └── Auto-scroll (messages change)
│
└── UI Elements
    ├── Header
    │   ├── Title + Persona badge
    │   └── Controls (mode toggle, clear, reset)
    │
    ├── Messages Container
    │   ├── Welcome message (empty state)
    │   ├── Message list
    │   │   ├── User messages (right)
    │   │   └── Assistant messages (left)
    │   ├── Loading indicator
    │   └── Error message
    │
    └── Input Area
        ├── Textarea (with Enter handling)
        └── Send button
```

### Backend Functions

```
chat.ts
├── Types
│   ├── Env (Cloudflare bindings)
│   ├── Message
│   ├── ChatRequest
│   ├── ChatResponse
│   └── ErrorResponse
│
├── Constants
│   ├── SYSTEM_PROMPT_BASE
│   └── MODE_MODIFIERS
│
├── Rate Limiting
│   ├── getClientIP()
│   └── checkRateLimit()
│
├── Prompt Engineering
│   ├── buildSystemPrompt()
│   └── trimMessages()
│
├── LLM Integration
│   ├── callGemini()
│   ├── callGroq()
│   └── getLLMReply()
│
├── Request Handling
│   ├── validateRequest()
│   ├── corsHeaders()
│   ├── onRequestOptions (CORS preflight)
│   └── onRequestPost (main handler)
```

## Data Models

### Message
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
}
```

### Chat Request
```typescript
interface ChatRequest {
  messages: Message[]
  mode?: 'soft' | 'snappy'
}
```

### Chat Response
```typescript
interface ChatResponse {
  reply: string
}
```

### Rate Limit Key
```
Format: rl:<ip>:<windowStart>
Example: rl:192.168.1.1:1735574400
Value: Request count (integer)
TTL: 2 × window size
```

## Security Architecture

### Input Validation
- JSON schema validation
- Role validation (user/assistant only)
- Content length limit (2000 chars)
- Message array validation
- Mode validation (soft/snappy only)

### Rate Limiting
- Per-IP tracking
- Fixed window algorithm
- Configurable limits
- KV-based storage
- Automatic expiration

### Content Safety
- System prompt constraints
- No hate speech/violence/threats
- No protected-class insults
- Topic deflection (politics/war)
- Maximum response length (1-3 sentences)

### API Security
- CORS restrictions (same-origin + localhost dev)
- No exposed secrets in code
- Environment variable isolation
- Cloudflare network protection

## State Management

### Client-Side (localStorage)
```javascript
// Keys
STORAGE_KEY = 'turshia_bot_chat'
MODE_KEY = 'turshia_bot_mode'

// Persistence strategy
- Load: On component mount
- Save: On messages change
- Save: On mode change
- Clear: On user action
```

### Server-Side (KV)
```javascript
// Rate limiting only
Key: rl:<ip>:<windowStart>
Value: count (string integer)
TTL: 2 × RATE_LIMIT_WINDOW_SEC

// Operations
- GET: Check current count
- PUT: Increment count
- Auto-expire: TTL-based cleanup
```

## Deployment Architecture

### Development
```
Local Machine
├── Vite Dev Server (:5173)
│   └── Proxies /api → :8788
└── Wrangler Pages Dev (:8788)
    └── Functions + KV binding
```

### Production
```
GitHub
    ↓ (push to main)
GitHub Actions
    ├── CI Workflow
    │   ├── Lint
    │   ├── Typecheck
    │   └── Build
    │
    └── Deploy Workflow
        └── Cloudflare Pages Action
                ↓
Cloudflare Edge Network
├── Pages (Static files)
│   └── React bundle
└── Functions (API)
    ├── /api/chat handler
    └── KV namespace binding
```

## API Endpoints

### POST /api/chat
- **Purpose:** Process chat message and return bot reply
- **Auth:** None (rate limited by IP)
- **Rate Limit:** 30 requests / 10 minutes (configurable)
- **Request:** JSON body with messages and mode
- **Response:** JSON with reply or error

### OPTIONS /api/chat
- **Purpose:** CORS preflight handling
- **Response:** 204 with CORS headers

## Environment Configuration

### Build-Time
- NODE_ENV (set by Vite)
- TypeScript compiler options
- Vite bundler config
- ESLint rules

### Runtime (Cloudflare)
- LLM_PROVIDER (gemini/groq)
- GEMINI_API_KEY (secret)
- GROQ_API_KEY (secret)
- RATE_LIMIT_MAX (default: 30)
- RATE_LIMIT_WINDOW_SEC (default: 600)

### Bindings
- RATE_KV (KV namespace)

## Performance Characteristics

### Frontend
- Initial load: ~145KB JS + 3KB CSS
- localStorage: O(1) read/write
- React reconciliation: Minimal (append-only messages)
- Network: 1 request per user message

### Backend
- KV read: < 10ms (edge)
- KV write: < 10ms (edge)
- LLM API: 200-2000ms (external)
- Total response: ~500-2500ms
- Cold start: ~50-200ms (Pages Functions)

### Scalability
- Cloudflare edge: Global distribution
- KV: Millions of operations/day
- Pages Functions: Auto-scaling
- Rate limiting: Prevents abuse
- No database bottleneck

## Error Handling

### Frontend
- Network errors → Display message
- API errors → Display error.message
- Validation errors → Display inline
- localStorage errors → Log, continue

### Backend
- Validation → 400 with error message
- Rate limit → 429 with Bulgarian message
- Provider error → 502 with Bulgarian message
- KV error → Log, return 502
- Unknown → 502 with generic message

## Monitoring Points

### Client-Side
- Console errors
- Network failures
- localStorage errors
- Rate limit responses

### Server-Side (Cloudflare Analytics)
- Function invocations
- Error rate
- Response time
- KV operations
- Bandwidth usage

## Future Architecture Considerations

### Streaming
- Add SSE endpoint
- Update frontend to handle streams
- Maintain backward compatibility

### Authentication
- Add user accounts
- Per-user rate limiting
- Conversation history storage

### Analytics
- Add telemetry events
- Track conversation metrics
- A/B testing framework

### Multi-Language
- Extract prompts to config
- Add language detection
- Route to appropriate prompts

---

**Version:** 1.0.0
**Last Updated:** 2025-12-29
