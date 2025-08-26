# 🤖 AI Developer Guide - TreeShop Terminal v2

## CRITICAL: READ THIS ENTIRE FILE BEFORE MAKING ANY CHANGES

This is the central command center for TreeShop's multi-site lead management system. If you're an AI developer (Claude, GPT, etc.) working on this codebase, you MUST read and understand this entire document first.

---

## 🎯 Project Overview

**TreeShop Terminal** is a real-time lead management dashboard that aggregates leads from multiple TreeShop websites:
- `treeshop.app` - Main consumer site
- `fltreeshop.com` - Production/commercial site
- `treeshopterminal.com` - This dashboard (localhost:3003)

### Core Purpose
Display leads from multiple websites in a single dashboard using Convex as the shared backend.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.1 with TypeScript and Tailwind CSS
- **Backend**: Convex (earnest-lemming-634.convex.cloud)
- **Real-time**: Auto-refresh every 10 seconds
- **Deployment**: Port 3003 locally

### Data Flow
1. Customer fills form on treeshop.app or fltreeshop.com
2. Form submits to Convex mutation: `terminalSync:createLead`
3. Terminal queries Convex: `terminalSync:syncLeadsToTerminal`
4. Dashboard displays leads with source identification

---

## 🔐 Internal Business Logic (CONFIDENTIAL)

### Service Center
- **Address**: 3634 Watermelon Lane, New Smyrna Beach, FL 32168
- **NEVER display this address publicly**

### Pricing Formula (INTERNAL ONLY)
```
Medium Package (6" DBH): $2,500/acre (baseline)
Small Package (4" DBH): $2,125/acre (Medium - 15%)
Large Package (8" DBH): $3,375/acre (Medium + 35%)
X-Large Package (10" DBH): $4,250/acre (Medium + 70%)

Transport: $350/hour round trip from New Smyrna
Project Cushion: 10% of subtotal
Customer sees: ONLY FINAL TOTAL
```

---

## 🔑 API Keys & Services

### Convex Backend
- **URL**: https://earnest-lemming-634.convex.cloud
- **Mutations**: 
  - `terminalSync:createLead` - Add new lead
  - `terminalSync:updatePartialLead` - Update partial lead
  - `terminalSync:upsertPartialLead` - Progressive tracking
- **Queries**:
  - `terminalSync:syncLeadsToTerminal` - Get all leads

### Google APIs Required
1. **Maps JavaScript API** - Address autocomplete
2. **Geocoding API** - Address validation
3. **Distance Matrix API** - Transport calculation (CRITICAL)
4. **Places API** - Address suggestions
5. **Analytics 4** - User tracking

**API Key**: `AIzaSyAYgdQgtzLNabDTBbCLK7iGfC15C9xnwA0`

---

## 📋 Linear Project Management

**Project**: TreeShop Terminal Central Command Integration
**Issues**:
- AIN-10: TreeShop.app integration
- AIN-11: FLTreeShop.com integration  
- AIN-16: Real-time progressive lead tracking

---

## 🚀 Development Workflow

### Starting the Terminal
```bash
cd ~/treeshop-terminal
npm install
npm run dev -- --port 3003
```

### Testing Lead Submission
```javascript
// Run in browser console
fetch('https://earnest-lemming-634.convex.cloud/api/mutation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'terminalSync:createLead',
    args: {
      name: 'Test Lead',
      email: 'test@test.com',
      phone: '555-0000',
      source: 'test',
      status: 'new',
      createdAt: Date.now()
    }
  })
}).then(r => r.json()).then(console.log);
```

---

## 📝 AI Developer Diary Rules

### MANDATORY: Update This Log Every Session

When you make changes, add an entry to `AI_DEVELOPER_DIARY.md`:

```markdown
## [Date] - [Your AI Model]
### Session ID: [If available]
### Developer: [Claude Code/GPT/etc]

#### What I Changed:
- List all modifications

#### Why I Changed It:
- Explain reasoning

#### Testing Performed:
- What you tested
- Results

#### Known Issues:
- Any problems discovered

#### Next Steps:
- What needs to be done next
```

---

## ⚠️ Critical Rules for AI Developers

1. **NEVER expose the New Smyrna Beach address publicly**
2. **NEVER show pricing breakdown to customers**
3. **ALWAYS use `terminalSync:createLead` mutation path**
4. **ALWAYS test in console before updating code**
5. **ALWAYS update the diary after making changes**
6. **NEVER modify Convex schema without updating `/convex/terminalSync.ts`**
7. **ALWAYS maintain backward compatibility with existing sites**

---

## 🐛 Common Issues & Solutions

### Leads Not Appearing
1. Check browser console for errors
2. Verify Convex mutation path is exactly `terminalSync:createLead`
3. Ensure `source` field matches site domain
4. Wait 10 seconds for auto-refresh

### Pricing Calculation Wrong
1. Distance Matrix API must be enabled
2. Service center is New Smyrna Beach, not Orlando
3. Transport is ALWAYS round trip
4. 10% cushion on subtotal

### CORS Errors
1. Convex accepts all origins by default
2. Check if path exists in Convex functions
3. Verify mutation args match schema

---

## 📂 Project Structure

```
/treeshop-terminal/
├── app/
│   ├── page.tsx          # Main dashboard (ONLY FILE THAT MATTERS)
│   └── layout.tsx         # Root layout
├── convex/
│   └── terminalSync.ts    # Convex mutations/queries
├── AI_DEVELOPER_README.md # This file
├── AI_DEVELOPER_DIARY.md  # Your updates go here
└── PRICING_FORMULA_INTERNAL.xml # Confidential pricing
```

---

## 🔄 Update Checklist

Before pushing any changes:
- [ ] Tested lead submission works
- [ ] Dashboard displays leads correctly
- [ ] Updated AI_DEVELOPER_DIARY.md
- [ ] No sensitive data exposed
- [ ] Backward compatible with sites
- [ ] Console has no errors

---

## 📞 Integration Status

- **treeshop.app**: ✅ Using terminalSync:createLead
- **fltreeshop.com**: ✅ Using terminalSync:createLead  
- **Terminal**: ✅ Displaying leads at localhost:3003

---

## 🎓 Learning Resources

1. Read all StartCMD XML files for context
2. Check Linear project for requirements
3. Test mutations in console first
4. Review pricing formula (internal only)

---

## 🚨 Emergency Contacts

- Linear Project: TreeShop Terminal Central Command Integration
- Convex Dashboard: dashboard.convex.dev
- GitHub: https://github.com/CVO-TreeAi/treeshopterminalv2

---

**Remember**: You're working on the central nervous system of a real business. Every lead matters. Test everything. Document everything. Break nothing.

## End of Required Reading

Now check `AI_DEVELOPER_DIARY.md` for recent changes and add your own entry when you start work.