# 📋 Issue Templates for Next Sprint

Copy-paste these into GitHub Issues at: https://github.com/InYrDim/attracted/issues/new

---

## Option 1: ISSUE-025 Onboarding Flow (P1 🔴)

**Title:** `feat: Implement ISSUE-025 — Guided Onboarding Flow for New Businesses`

**Labels:** `priority: P1`, `type: feature`, `phase: platform`

**Body:**
```markdown
## Description
Guided setup wizard for new businesses after signup. Ensures businesses are functional and ready to receive leads within minutes.

## Requirements
1. **Step 1: Create Business** — Auto-create on signup (already happens in better-auth), let user set name + slug
2. **Step 2: Add First Product** — Simple product form (name, base price, variants)
3. **Step 3: Connect First Channel** — WhatsApp recommended (OAuth/webhook setup), skip-able
4. **Step 4: Invite Team** — Optional, skip-able
5. **Step 5: Connect Ad Account** — Optional, skip-able
6. **Step 6: Redirect to Inbox** — Landing page

## Acceptance Criteria
- [ ] Step-by-step wizard after signup
- [ ] Skippable steps marked optional
- [ ] Completes with functional business ready to receive leads
- [ ] Progress saved if user leaves mid-flow
- [ ] Responsive mobile layout

## Technical Notes
- New route: `/onboarding` (protected, only accessible before onboarding_complete flag)
- Add `onboarding_completed: boolean` to `business` table
- Reuse existing product/channel/ad-account components
- Better-auth `onboarding` plugin or custom middleware
```

---

## Option 2: ISSUE-020 Ad Performance Report (P2 🔴)

**Title:** `feat: Implement ISSUE-020 — Ad Performance Report Dashboard`

**Labels:** `priority: P2`, `type: feature`, `phase: reporting`

**Body:**
```markdown
## Description
Detailed ad performance breakdown using data from connected ad accounts + CAPI events.

## Metrics to Display
- Leads per campaign / ad set / ad
- Cost per Lead (CPL) = Spend / Leads
- ROAS = Revenue from attributed orders / Ad Spend
- Conversion rate by campaign
- Channel comparison (Meta vs TikTok vs Google)

## Requirements
- Date range picker (today, 7d, 30d, 90d, custom)
- Compare to previous period (trend arrows)
- Filter by platform, campaign, ad set
- Drill-down: Campaign → Ad Set → Ad
- Export CSV

## Acceptance Criteria
- [ ] Dashboard renders with real data from adAccount + adCampaign + CAPI events
- [ ] Date range filter works
- [ ] Period comparison shows trend arrows
- [ ] Pipeline funnel visualization
- [ ] CSV export

## Technical Notes
- New route: `/dashboard/reports/ads`
- Server actions in `src/actions/reports.ts` (getAdPerformance)
- Need CAPI event logging tables (lead_events, purchase_events) — extend schema
- Use Recharts (already in deps) for charts
- Leverage existing adAccount/adCampaign relations
```

---

## Option 3: ISSUE-009 Instagram DM Integration (P1 🔴)

**Title:** `feat: Implement ISSUE-009 — Instagram DM Integration via Meta Graph API`

**Labels:** `priority: P1`, `type: integration`, `phase: channels`

**Body:**
```markdown
## Description
Connect Instagram Business as a channel for inbound/outbound messaging via Meta Graph API.

## Requirements
- Webhook endpoint: `/api/webhooks/instagram` (verify challenge)
- OAuth flow in Settings → Channels to connect Instagram Business account
- Parse incoming DMs → create/update lead → create conversation + message
- Send DM replies via Meta Graph API
- Handle media attachments (images)

## Acceptance Criteria
- [ ] Instagram DMs appear in Unified Inbox
- [ ] Agent can reply from inbox → DM sent via Instagram
- [ ] OAuth connection flow in Settings
- [ ] Media attachments handled
- [ ] Webhook signature verification

## Technical Notes
- Meta Graph API requires Instagram Business + Facebook Page linked
- Use existing `channel` table (type: `instagram`)
- Store access_token encrypted in channel.config
- Webhook events: `messages`, `messaging_postbacks`, `messaging_reactions`
- Message sending: `POST /{ig_user_id}/messages` with recipient + message
- Reuse WhatsApp webhook pattern from ISSUE-008
```

---

## Quick Decision Guide

| If you want... | Pick |
|---|---|
| Better first-time user experience, increase activation | **Option 1: Onboarding** |
| Show ROI to users, justify ad spend tracking | **Option 2: Ad Report** |
| Support Instagram sellers (huge in Indonesia) | **Option 3: Instagram DM** |

---

## Alternative: Let me pick based on dependency graph

Looking at the build order in ISSUE.md:
1. **ISSUE-008** WhatsApp ✅ (done)
2. **ISSUE-012** Meta CAPI ✅ (done)  
3. **ISSUE-018** Click Tracking ✅ (done)
4. **ISSUE-011** Web Form ✅ (done)
5. **ISSUE-017** Automation ✅ (done)
6. **ISSUE-023** Team Mgmt ✅ (done)
7. **ISSUE-025** Onboarding ← **NEXT LOGICAL**
8. **ISSUE-019** Dashboard
9. **ISSUE-015** Ad Account UI ✅ (done)
10. **ISSUE-009** Instagram DM

**Recommendation:** **ISSUE-025 Onboarding Flow** — it's the next dependency-free P1 item.