# TreeShop Terminal v2

Central lead management dashboard for TreeShop's multi-site ecosystem.

## 🚨 For AI Developers

**⚠️ CRITICAL: If you are an AI developer (Claude, GPT, etc.), you MUST read `AI_DEVELOPER_README.md` before making ANY changes.**

After reading the main guide, check `AI_DEVELOPER_DIARY.md` for recent changes and add your own entry when you start work.

## Quick Start

```bash
npm install
npm run dev -- --port 3003
```

Open [http://localhost:3003](http://localhost:3003) to view the Terminal.

## Features

- Real-time lead display from multiple sites
- Source identification (color-coded)
- Auto-refresh every 10 seconds
- Clean, simple interface
- Convex real-time backend

## Tech Stack

- **Framework**: Next.js 15.5.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Convex (earnest-lemming-634)
- **Port**: 3003

## Project Structure

```
/treeshop-terminal/
├── app/
│   └── page.tsx           # Main dashboard component
├── convex/
│   └── terminalSync.ts    # Convex mutations and queries
├── AI_DEVELOPER_README.md # MUST READ for AI developers
├── AI_DEVELOPER_DIARY.md  # Change log (update after changes)
└── README.md              # This file
```

## Testing Lead Submission

```javascript
// Run in browser console to test
fetch('https://earnest-lemming-634.convex.cloud/api/mutation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'terminalSync:createLead',
    args: {
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '555-0000',
      source: 'test',
      status: 'new',
      createdAt: Date.now()
    }
  })
}).then(r => r.json()).then(console.log);
```

## Sites Integrated

- `treeshop.app` - Main consumer site
- `fltreeshop.com` - Production/commercial site

## License

Private - TreeShop Internal Use Only
