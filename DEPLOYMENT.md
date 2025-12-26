# Puppeteer/Chrome Deployment Guide

## The Issue

Puppeteer requires Chrome/Chromium to be installed. In production environments (Vercel, AWS Lambda, Railway, etc.), Chrome is not pre-installed, causing this error:

```
Could not find Chrome (ver. 131.0.6778.204)
```

## Solutions Implemented

### 1. **Automatic Chrome Installation** (Recommended)
The `postinstall` script now automatically downloads Chrome:

```json
"postinstall": "prisma generate && npx puppeteer browsers install chrome"
```

This runs during:
- `npm install`
- `npm ci` (in CI/CD)
- Deployment builds

### 2. **System Chrome Detection**
The code now checks for system-installed Chrome in production:

```typescript
// LaunchBrowserExecutor.ts checks these paths:
- /usr/bin/google-chrome
- /usr/bin/chromium-browser
- /usr/bin/chromium
- process.env.CHROME_PATH (custom path)
```

### 3. **Production-Optimized Flags**
Added essential Chrome flags for serverless environments:

```typescript
args: [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",    // Prevents shared memory issues
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",                // Single-process mode
  "--disable-gpu",
]
```

## Platform-Specific Setup

### Vercel
Add to `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 300
    }
  }
}
```

### Docker
```dockerfile
FROM node:18-alpine

# Install Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### AWS Lambda
Use layer: `chrome-aws-lambda`
```bash
npm install chrome-aws-lambda
```

### Railway/Render
Add buildpack:
```
https://github.com/heroku/heroku-buildpack-google-chrome
```

## Environment Variables

Set custom Chrome path if needed:
```env
CHROME_PATH=/custom/path/to/chrome
NODE_ENV=production
```

## Testing Locally

```bash
# Install Chrome
npx puppeteer browsers install chrome

# Verify installation
npx puppeteer browsers list

# Test in production mode
NODE_ENV=production npm run dev
```

## Troubleshooting

### Error: "Chrome didn't launch"
- Increase memory: 3GB minimum for serverless
- Check `/tmp` directory permissions
- Verify Chrome installation: `which google-chrome`

### Error: "Protocol error"
- Add `--disable-dev-shm-usage` flag
- Increase timeout in `page.goto()`

### Still not working?
Check logs for Chrome path being used:
```
Browser log: "Using Chrome at: /usr/bin/google-chrome"
```

If no path is logged, Chrome wasn't found. Install manually or set `CHROME_PATH`.
