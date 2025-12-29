# Deployment Checklist

Complete checklist for deploying TURSHIA.BOT to production.

## ✅ Pre-Deployment

### Local Setup
- [ ] Run `npm install` successfully
- [ ] Run `npm run typecheck` with no errors
- [ ] Run `npm run lint` with no errors
- [ ] Run `npm run build` successfully
- [ ] Test locally with both dev servers running

### Git Repository
- [ ] Initialize git: `git init`
- [ ] Create GitHub repository
- [ ] Add remote: `git remote add origin <url>`
- [ ] Commit all files: `git add . && git commit -m "Initial commit"`
- [ ] Push to GitHub: `git push -u origin main`

## ✅ Cloudflare Setup

### 1. KV Namespace
```bash
npx wrangler kv:namespace create RATE_KV --preview false
```
- [ ] Copy the namespace ID
- [ ] Update `wrangler.toml` with the ID

### 2. Create Pages Project
- [ ] Go to Cloudflare Dashboard > Pages
- [ ] Click "Create a project"
- [ ] Connect to GitHub
- [ ] Select your repository
- [ ] Build settings:
  - Framework preset: None
  - Build command: `npm run build`
  - Build output directory: `dist`
- [ ] Click "Save and Deploy"

### 3. Configure KV Binding
- [ ] Go to Pages project > Settings > Functions
- [ ] Scroll to "KV namespace bindings"
- [ ] Click "Add binding"
- [ ] Variable name: `RATE_KV`
- [ ] Select your KV namespace
- [ ] Click "Save"

### 4. Set Environment Variables
Go to Pages project > Settings > Environment Variables

**Production environment:**
- [ ] `LLM_PROVIDER` = `gemini` (or `groq`) - Plain text
- [ ] `GEMINI_API_KEY` = `your-key-here` - **Secret**
- [ ] `RATE_LIMIT_MAX` = `30` - Plain text (optional)
- [ ] `RATE_LIMIT_WINDOW_SEC` = `600` - Plain text (optional)

**Preview environment (optional):**
- [ ] Same as production OR
- [ ] Use different keys/limits for testing

### 5. Create API Token
- [ ] Go to https://dash.cloudflare.com/profile/api-tokens
- [ ] Click "Create Token"
- [ ] Use template: "Edit Cloudflare Workers"
- [ ] OR create custom with permissions:
  - Account > Cloudflare Pages: Edit
  - Account > Workers KV Storage: Edit
- [ ] Copy the token (save it securely!)

## ✅ GitHub Actions Setup

### Add Secrets
Go to GitHub repository > Settings > Secrets and variables > Actions

- [ ] Click "New repository secret"
- [ ] Add `CLOUDFLARE_API_TOKEN` = (token from step 5)
- [ ] Add `CLOUDFLARE_ACCOUNT_ID` = (from Cloudflare dashboard URL)
- [ ] Add `CLOUDFLARE_PROJECT_NAME` = (your Pages project name, e.g., "turshia-bot")

### Verify Workflows
- [ ] Check `.github/workflows/ci.yml` exists
- [ ] Check `.github/workflows/deploy-pages.yml` exists
- [ ] Both workflows should be committed to main

## ✅ First Deployment

### Trigger Deploy
- [ ] Push to main branch: `git push origin main`
- [ ] Go to GitHub repository > Actions tab
- [ ] Verify "CI" workflow runs and passes
- [ ] Verify "Deploy to Cloudflare Pages" workflow runs
- [ ] Check Cloudflare Dashboard for deployment status

### Verify Deployment
- [ ] Visit your Pages URL (e.g., `turshia-bot.pages.dev`)
- [ ] Chat interface loads correctly
- [ ] Try sending a message
- [ ] Verify bot responds in Bulgarian
- [ ] Test rate limiting (send 30+ messages)
- [ ] Check mode toggle works
- [ ] Verify localStorage persists messages

### Check Logs
- [ ] Cloudflare Dashboard > Pages > Project > Functions
- [ ] View function logs for any errors
- [ ] Check for API errors or configuration issues

## ✅ Post-Deployment

### Test Endpoints
```bash
# Replace with your actual domain
curl -X POST https://turshia-bot.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Здрасти"}],
    "mode": "snappy"
  }'
```

Expected response:
```json
{
  "reply": "Здрасти бе. Какво стана..."
}
```

### Monitor
- [ ] Check function invocation count
- [ ] Monitor error rate
- [ ] Verify rate limiting works
- [ ] Check KV read/write operations
- [ ] Review Cloudflare Analytics

### Custom Domain (Optional)
- [ ] Go to Pages project > Custom domains
- [ ] Add your domain
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate
- [ ] Test on custom domain

## ✅ Troubleshooting

### Functions Return 500
- Check KV binding is set
- Verify environment variables are configured
- Check function logs for details

### API Returns 502
- Verify LLM_PROVIDER is set correctly
- Check API key is valid
- Ensure API key has sufficient quota

### CORS Errors
- Production uses same-origin only
- For development, ensure localhost:5173 is allowed in code

### Rate Limiting Too Strict
- Adjust RATE_LIMIT_MAX in environment variables
- Or clear KV namespace: `npx wrangler kv:key list --binding RATE_KV`

### Build Fails
- Check Node.js version (20+)
- Verify all dependencies in package.json
- Run `npm run build` locally to debug
- Check GitHub Actions logs

## ✅ Security Checklist

- [ ] API keys are stored as Secrets in Cloudflare
- [ ] API keys are NOT in GitHub repository
- [ ] API keys are NOT in GitHub secrets (only CF API token is)
- [ ] .dev.vars is in .gitignore
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Content safety rules in system prompt

## ✅ Maintenance

### Regular Tasks
- [ ] Monitor Cloudflare Analytics weekly
- [ ] Check for npm package updates monthly
- [ ] Review and rotate API keys quarterly
- [ ] Clear old KV entries if needed
- [ ] Update documentation as needed

### Update Dependencies
```bash
npm update
npm audit fix
npm run build
git commit -am "Update dependencies"
git push
```

### Update LLM Models
- Edit `functions/api/chat.ts`
- Update model names in `callGemini` or `callGroq`
- Test locally
- Deploy via git push

## ✅ Success Criteria

- ✅ Site is accessible at Pages URL
- ✅ Chat sends and receives messages
- ✅ Bot responds in Bulgarian
- ✅ Persona matches specification
- ✅ Rate limiting prevents abuse
- ✅ No console errors
- ✅ Mobile responsive
- ✅ CI/CD pipeline working
- ✅ Environment variables secured
- ✅ KV namespace operational

## Support

If issues persist:
1. Check [README.md](README.md) troubleshooting section
2. Review Cloudflare function logs
3. Check GitHub Actions logs
4. Verify all checklist items completed

---

**Last Updated:** 2025-12-29
**Status:** Ready for deployment 🚀
