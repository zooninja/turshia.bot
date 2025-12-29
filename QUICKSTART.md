# Quick Start Guide

Get TURSHIA.BOT running in 5 minutes.

## Local Development

1. **Add branding assets:**

   Place these images in `/public` folder:
   - `branding.png` - Full branding image
   - `logo.png` - Square logo for favicon

   (See [BRANDING.md](BRANDING.md) for details)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create KV namespace:**
   ```bash
   npx wrangler kv:namespace create RATE_KV
   ```

   Update the ID in `wrangler.toml`.

4. **Set up environment variables:**

   Copy `.dev.vars.example` to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Edit `.dev.vars` and add your API key:
   ```bash
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-actual-api-key-here
   ```

5. **Run dev servers:**

   Terminal 1:
   ```bash
   npm run dev
   ```

   Terminal 2:
   ```bash
   npm run pages:dev
   ```

6. **Open in browser:**
   ```
   http://localhost:5173
   ```

You should see the TURSHIA.BOT logo with Бай Тошо and the wooden-style control buttons!

## Deploy to Cloudflare Pages

### First Time Setup

1. **Create Cloudflare Pages project:**
   - Go to Cloudflare dashboard > Pages
   - Create new project from GitHub repo
   - Build settings: Framework preset = None, Build command = `npm run build`, Output directory = `dist`

2. **Create KV namespace (production):**
   ```bash
   npx wrangler kv:namespace create RATE_KV --preview false
   ```

3. **Configure KV binding in Cloudflare:**
   - Pages project > Settings > Functions
   - Add KV namespace binding: `RATE_KV`

4. **Set environment variables in Cloudflare:**
   - Pages project > Settings > Environment Variables
   - Add (Production):
     - `LLM_PROVIDER` = `gemini`
     - `GEMINI_API_KEY` = your key (mark as Secret)
     - `RATE_LIMIT_MAX` = `30`
     - `RATE_LIMIT_WINDOW_SEC` = `600`

### GitHub Actions Setup

1. **Create Cloudflare API token:**
   - https://dash.cloudflare.com/profile/api-tokens
   - Template: "Edit Cloudflare Workers"
   - Permissions: Account > Cloudflare Pages (Edit), Workers KV (Edit)

2. **Add GitHub secrets:**
   - Repo > Settings > Secrets and variables > Actions
   - Add:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID` (from Cloudflare dashboard)
     - `CLOUDFLARE_PROJECT_NAME` (your Pages project name)

3. **Push to main:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

The deploy workflow will automatically deploy to Cloudflare Pages!

## Getting API Keys

### Google Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Groq
1. Go to https://console.groq.com/
2. Sign up / log in
3. Go to API Keys section
4. Create new API key
5. Copy the key

## Troubleshooting

**Build fails:** Run `npm run build` locally to see the error.

**Functions don't work:** Check KV binding is set in Cloudflare Pages dashboard.

**Rate limit errors:** Clear KV namespace or adjust limits.

**CORS errors:** Check Origin header matches allowed origins in `functions/api/chat.ts`.

For detailed troubleshooting, see [README.md](README.md).
