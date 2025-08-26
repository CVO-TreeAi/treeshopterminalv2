# 🤖 AI Developer Diary - TreeShop Terminal

This diary tracks all changes made by AI developers. **MANDATORY**: Add an entry every time you work on this project.

---

## 2025-08-26 - Claude Code (claude-opus-4-1-20250805)
### Session ID: Initial Setup
### Developer: Claude Code

#### What I Changed:
1. Created fresh Next.js application to replace v1
2. Built simple lead display dashboard in `app/page.tsx`
3. Connected to Convex backend (earnest-lemming-634)
4. Created Convex mutations in `/convex/terminalSync.ts`:
   - `terminalSync:createLead` - Main mutation for sites to use
   - `terminalSync:syncLeadsToTerminal` - Query for Terminal to fetch leads
   - `terminalSync:updatePartialLead` - For progressive tracking
   - `terminalSync:upsertPartialLead` - For real-time field updates
5. Set up auto-refresh every 10 seconds
6. Added source identification (color-coded badges)
7. Created comprehensive documentation system

#### Why I Changed It:
- User deleted v1 and wanted clean, simple lead viewer
- Previous version had OAuth complexity not needed
- Sites needed correct mutation path to submit leads
- Terminal needed to just display leads from Convex

#### Testing Performed:
- Created test leads via curl commands
- Verified leads appear in Convex backend
- Confirmed Terminal displays leads with source identification
- Tested auto-refresh functionality
- Validated both treeshop.app and fltreeshop.com sources work

#### Known Issues:
1. Terminal shows 0 leads initially (needs browser console check)
2. FLTreeShop form at localhost:3001 may need Google Maps API fix
3. Real-time progressive tracking not yet implemented on sites
4. No authentication on Terminal (publicly accessible)

#### Next Steps:
1. Sites need to implement `terminalSync:createLead` mutation
2. Add progressive field tracking for partial leads
3. Implement proper error handling in Terminal
4. Consider adding filters/search to Terminal
5. Add export functionality for leads

#### Files Created:
- `app/page.tsx` - Main dashboard
- `convex/terminalSync.ts` - All Convex functions
- `AI_DEVELOPER_README.md` - Comprehensive guide
- `AI_DEVELOPER_DIARY.md` - This diary
- `PRICING_FORMULA_INTERNAL.xml` - Confidential pricing logic
- Multiple StartCMD XML files for site integration

#### Critical Information:
- Convex URL: https://earnest-lemming-634.convex.cloud
- Mutation path: `terminalSync:createLead` (NOT `leads:createLead`)
- Service center: 3634 Watermelon Lane, New Smyrna Beach, FL 32168
- Pricing: $2500/acre base (Medium), $350/hour transport, 10% cushion
- NEVER expose internal addresses or pricing breakdown

---

## Future Entries Go Below

<!-- 
Template for new entries:

## [YYYY-MM-DD] - [Your AI Model]
### Session ID: [If available]
### Developer: [Claude Code/GPT/etc]

#### What I Changed:
- 

#### Why I Changed It:
- 

#### Testing Performed:
- 

#### Known Issues:
- 

#### Next Steps:
- 

-->