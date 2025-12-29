# TURSHIA.BOT

A joke chatbot web app featuring "Бай Тошо – консултант по туршия и лютеница" (Bay Tosho - pickles and chutney consultant). Built with React, TypeScript, and Cloudflare Pages Functions.

## Overview

TURSHIA.BOT is a humorous Bulgarian-language chatbot with a rural, grumpy persona that specializes in talking about pickles (туршия) and chutney (лютеница). The bot responds in Bulgarian with a folksy, slightly rude but safe tone.

**Features:**
- Real-time chat interface with conversation history
- Two personality modes: "Малко по-мек" (softer) and "Малко по-троснат" (snappier)
- Rate limiting to prevent abuse
- LLM provider abstraction (supports Gemini and Groq)
- Cloudflare KV-based rate limiting
- GitHub Actions CI/CD pipeline

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Cloudflare Pages Functions (TypeScript)
- **Rate Limiting:** Cloudflare KV
- **LLM Providers:** Google Gemini or Groq
- **CI/CD:** GitHub Actions
- **Hosting:** Cloudflare Pages

## Branding Assets Required

**IMPORTANT**: Before running the app, add these branding images to the `/public` folder:

1. **branding.png** - Full branding image (logo + Бай Тошо character + products)
2. **logo.png** - Square cropped version for favicon

See [BRANDING.md](BRANDING.md) for complete branding guidelines and asset specifications.

## Project Structure

```
toshobota/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI workflow
│       └── deploy-pages.yml          # Deploy workflow
├── functions/
│   └── api/
│       └── chat.ts                   # Backend API endpoint
├── public/
│   ├── branding.png                  # Main branding image (YOU MUST ADD)
│   ├── logo.png                      # Favicon (YOU MUST ADD)
│   └── vite.svg                      # Default icon
├── src/
│   ├── App.css                       # Main app styles
│   ├── App.tsx                       # Main app component
│   ├── index.css                     # Global styles
│   ├── main.tsx                      # Entry point
│   └── vite-env.d.ts                 # Vite types
├── .editorconfig                     # Editor config
├── .eslintrc.cjs                     # ESLint config
├── .prettierrc                       # Prettier config
├── index.html                        # HTML entry
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Vite config
└── wrangler.toml                     # Cloudflare config
```

## Local Development

### Prerequisites

- Node.js 20+ and npm
- Cloudflare account
- API key from either Google Gemini or Groq

### Setup Steps

1. **Add branding assets:**

   Place the following images in the `/public` folder:
   - `branding.png` - Full branding image (provided in project assets)
   - `logo.png` - Square cropped logo for favicon

   See [BRANDING.md](BRANDING.md) for specifications.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create Cloudflare KV namespace:**
   ```bash
   npx wrangler kv:namespace create RATE_KV
   ```

   Copy the namespace ID from the output and update `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_KV"
   id = "your-namespace-id-here"
   ```

4. **Set up local environment variables:**

   Create a `.dev.vars` file in the project root (this file is gitignored):
   ```bash
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-api-key-here
   # OR
   # LLM_PROVIDER=groq
   # GROQ_API_KEY=your-groq-api-key-here

   RATE_LIMIT_MAX=30
   RATE_LIMIT_WINDOW_SEC=600
   ```

5. **Run the development servers:**

   You need to run both the Vite dev server and Cloudflare Pages dev server:

   Terminal 1 - Frontend:
   ```bash
   npm run dev
   ```

   Terminal 2 - Backend (Pages Functions):
   ```bash
   npm run pages:dev
   ```

   The frontend will be available at `http://localhost:5173` and will proxy API requests to the Pages dev server on port 8788.

## Cloudflare Pages Configuration

### Environment Variables & Secrets

Configure these in the Cloudflare Pages dashboard (Settings > Environment Variables):

**Required:**
- `LLM_PROVIDER` (plain): `gemini` or `groq`
- `GEMINI_API_KEY` (secret): Your Google Gemini API key (if using Gemini)
- `GROQ_API_KEY` (secret): Your Groq API key (if using Groq)

**Optional:**
- `RATE_LIMIT_MAX` (plain): Max requests per window (default: 30)
- `RATE_LIMIT_WINDOW_SEC` (plain): Window size in seconds (default: 600)

### Setting up KV Binding

1. Create the KV namespace (if not done already):
   ```bash
   npx wrangler kv:namespace create RATE_KV --preview false
   ```

2. In Cloudflare Pages dashboard:
   - Go to your project > Settings > Functions
   - Scroll to "KV namespace bindings"
   - Add binding: Variable name = `RATE_KV`, KV namespace = select your namespace

## GitHub Actions Setup

### Required GitHub Secrets

Set these in your GitHub repository (Settings > Secrets and variables > Actions):

1. **`CLOUDFLARE_API_TOKEN`**:
   - Create at: https://dash.cloudflare.com/profile/api-tokens
   - Use template: "Edit Cloudflare Workers"
   - Or create custom token with permissions:
     - Account > Cloudflare Pages: Edit
     - Account > Workers KV Storage: Edit

2. **`CLOUDFLARE_ACCOUNT_ID`**:
   - Find in Cloudflare dashboard URL or Workers overview page

3. **`CLOUDFLARE_PROJECT_NAME`**:
   - Your Cloudflare Pages project name (e.g., "turshia-bot")

### Workflows

- **CI** (`.github/workflows/ci.yml`): Runs on push and PRs - lints, type checks, and builds
- **Deploy** (`.github/workflows/deploy-pages.yml`): Deploys to Cloudflare Pages on push to main

## API Documentation

### POST /api/chat

Request:
```json
{
  "messages": [
    { "role": "user", "content": "Как да направя туршия?" },
    { "role": "assistant", "content": "Еее, то лесно е бе..." },
    { "role": "user", "content": "А колко сол да сложа?" }
  ],
  "mode": "soft"
}
```

Response (success):
```json
{
  "reply": "Ами гледай бе, сол ше сложиш колко ти дойде на ръката. Може 2-3 супени лъжици на литър вода."
}
```

Response (rate limit):
```json
{
  "error": "Стига бе, много питаш. Почакай малко."
}
```

Response (error):
```json
{
  "error": "Еee, нещо се счупи бе. Опитай пак."
}
```

### cURL Example

```bash
curl -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Как да направя туршия?"}
    ],
    "mode": "snappy"
  }'
```

## Sample User Prompts & Expected Tone

1. **User:** "Как да направя туршия?"
   **Expected:** "Еee, то няма наука бе. Взимаш краставички, сол, вода и чакаш. Ама ти да не питаш колко да чакаш?"

2. **User:** "Колко сол да сложа?"
   **Expected:** "Гледай, 2-3 супени лъжици на литър. То като ти дойде на ръката, толкоз. Ама дали е добре, не знам бе."

3. **User:** "Кажи ми нещо за политиката"
   **Expected:** "Ееее, политика... Ми то аз за туршия разбирам, не за тия работи. Ше ми кажеш ли колко туршия имаш за зимата?"

4. **User:** "Защо лютеницата ми излезе кисела?"
   **Expected:** "То като си ял кисели чушки, ше ти излезе кисело бе. Друг път гледай да са сладки."

5. **User:** "Здрасти!"
   **Expected:** "Здрасти бе. Какво стана, дошъл си да ме питаш нещо ли? Давай казвай."

## Rate Limiting

- **Default:** 30 requests per 10 minutes per IP
- **Implementation:** Fixed window using Cloudflare KV
- **Key format:** `rl:<ip>:<windowStart>`
- **Headers used:** `CF-Connecting-IP` (primary), falls back to `request.cf.ip`

## Constraints & Safety

The bot follows strict guidelines:
- Responds only in Bulgarian
- 1-3 sentences maximum
- No emojis
- Light rural slang
- Every ~3rd response includes a follow-up question
- **No slurs, hate speech, threats, or violence**
- **No sexual content or self-harm**
- Deflects politics/war/hate topics to pickles or silly refusals
- Insults are only "bitovi/infantilni" (petty/childish), never serious

## Troubleshooting

### Error: "Няма връзка със сървъра"
- Check that both dev servers are running
- Verify the Vite proxy is configured correctly (vite.config.ts)
- Check browser console for CORS errors

### Error: "Стига бе, много питаш. Почакай малко." (429)
- You've hit the rate limit
- Wait 10 minutes or adjust `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_SEC`
- Clear your KV namespace: `npx wrangler kv:key delete --binding RATE_KV "rl:your-ip:timestamp"`

### Error: "Еee, нещо се счупи бе. Опитай пак." (502)
- Check that API keys are configured correctly
- Verify `LLM_PROVIDER` is set to `gemini` or `groq`
- Check Cloudflare Pages logs for details
- Ensure your Gemini/Groq API key has sufficient quota

### CORS Issues
- Local development: Ensure `http://localhost:5173` is in allowed origins (functions/api/chat.ts:246)
- Production: CORS is same-origin only
- Check browser console for specific CORS errors

### Missing Environment Variables
- **Local:** Check `.dev.vars` file exists and has correct values
- **Production:** Verify in Cloudflare Pages dashboard > Settings > Environment Variables
- **Common mistake:** API keys must be marked as "Secret" in Cloudflare

### KV Namespace Not Found
- Verify `wrangler.toml` has the correct KV namespace ID
- Check that KV binding is configured in Cloudflare Pages dashboard
- Run: `npx wrangler kv:namespace list` to see all namespaces

### Build Fails in GitHub Actions
- Check that all dependencies are in `package.json`
- Verify `npm run build` works locally
- Review workflow logs for specific errors
- Ensure Node.js version matches (20+)

### Deployment Succeeds But Functions Don't Work
- Verify KV binding is set in Cloudflare Pages (not just wrangler.toml)
- Check all environment variables are set in Cloudflare dashboard
- Review Cloudflare Pages function logs: Dashboard > Pages > Project > Functions

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run pages:dev` - Start Cloudflare Pages dev server
- `npm run pages:deploy` - Deploy to Cloudflare Pages via Wrangler

## License

This is a demonstration project. Use at your own risk.

## Getting Help

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Cloudflare Workers KV:** https://developers.cloudflare.com/kv/
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
