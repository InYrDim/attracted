# Attract — Issue Tracker

## Status Legend

- 🔴 Not started
- 🟡 In progress
- 🟢 Done

---

## Phase 0 — Foundation & Auth

### ISSUE-001: Multi-tenant DB Schema

**Priority:** P0 | **Status:** 🟢

Implement all application tables in `src/db/schema.ts`:

**Tables:**

| Table | Key Columns |
|---|---|
| `business` | id, name, slug, owner_id (FK→user), plan, created_at |
| `business_member` | id, business_id (FK), user_id (FK), role (owner/admin/agent), invited_at, accepted_at |
| `product` | id, business_id (FK), name, description, base_price, variants (jsonb), is_active, created_at |
| `lead` | id, business_id (FK), name, phone, email, channel_id (FK), ad_id (nullable), click_id (nullable), utm_source/medium/campaign/content (nullable), status (enum: new_lead/contacted/interested/order/delivered/lost), assigned_agent_id (FK→business_member), first_responded_at, created_at, updated_at |
| `order` | id, business_id (FK), lead_id (FK), agent_id (FK→business_member), items (jsonb), total_price, shipping_address, shipping_courier, tracking_number, status (pending/processing/shipped/delivered/cancelled), created_at, updated_at |
| `channel` | id, business_id (FK), type (enum: whatsapp/instagram/tiktok/webform), name, config (jsonb — credentials, webhook_url, connected status), created_at |
| `ad_account` | id, business_id (FK), platform (enum: meta/tiktok/google), account_id, access_token (encrypted), is_active, created_at |
| `conversation` | id, business_id (FK), lead_id (FK), channel_id (FK), last_message_at, created_at |
| `message` | id, conversation_id (FK), sender_type (enum: lead/agent/system), content, attachments (jsonb), created_at |
| `automation_rule` | id, business_id (FK), trigger (string — e.g. "lead.status_changed", "lead.created"), conditions (jsonb), action_type (enum: send_message/assign_agent/notify/change_status), action_config (jsonb), is_active, created_at |
| `ad_campaign` | id, business_id (FK), ad_account_id (FK), platform_campaign_id, name, status, metadata (jsonb), created_at |

**Relations:**
- Business → has many: members, products, leads, orders, channels, ad_accounts, automation_rules, ad_campaigns
- Lead → belongs to business, channel; has one conversation; has many orders; assigned to member
- Order → belongs to lead, business, member
- Conversation → has many messages; belongs to lead, channel, business
- Business Member → user + business with role

**Acceptance Criteria:**
- [ ] All tables defined with correct types, relations, and indexes
- [ ] `drizzle.config.ts` already references `schema.ts` — verify it picks up new tables
- [ ] `bun run db:generate` produces valid migration
- [ ] `bun run db:migrate` applies cleanly to local DB

---

### ISSUE-002: Multi-tenant Auth & RBAC

**Priority:** P0 | **Status:** 🟡

Extend better-auth in `src/lib/auth.ts` to support multi-tenancy and role-based access.

**Requirements:**
- Add `organization` / multi-tenant plugin from better-auth (or custom business membership)
- On signup: auto-create a `business` row and add user as `owner`
- On login: resolve user's business(es); set active business in session/token
- Roles: `owner`, `admin`, `agent` — enforced at API/middleware level
- Middleware (`src/middleware.ts`): protect all `/dashboard/*` routes; resolve `active_business_id` from session; reject unauthenticated access
- Team invitation flow: owner/admin can invite by email; assign role

**Acceptance Criteria:**
- [ ] Signup creates business + owner membership
- [ ] Login returns user with business context
- [ ] Middleware blocks unauthenticated access to app routes
- [ ] Role checks available as utility (e.g. `requireRole(businessId, 'admin')`)
- [ ] Invite flow: send email → accept → create membership record

---

### ISSUE-003: App Shell & Navigation

**Priority:** P0 | **Status:** 🟢

Build the authenticated app layout with sidebar navigation.

**Pages & Structure:**
```
/dashboard          → redirect to /dashboard/overview
/dashboard/overview → Dashboard home (metrics)
/dashboard/inbox    → Unified Inbox
/dashboard/leads    → Leads pipeline/list
/dashboard/leads/[id] → Lead detail
/dashboard/orders   → Orders list
/dashboard/orders/[id] → Order detail
/dashboard/products → Products management
/dashboard/settings → Business settings
/dashboard/settings/channels → Channel integrations
/dashboard/settings/ads     → Ad account integrations
/dashboard/settings/team    → Team management
/dashboard/settings/automation → Automation rules
```

**Shell Components:**
- `AppSidebar` — collapsible sidebar with nav items, business name, user avatar, active business switcher
- `AppHeader` — top bar with breadcrumbs, user menu, notifications
- `AuthShell` — wraps all `/dashboard/*` pages; ensures auth + business context

**Unauthenticated Pages:**
- `/login` — email/password login form
- `/signup` — registration form (creates business)
- `/invite/[token]` — team invitation acceptance

**Acceptance Criteria:**
- [ ] Authenticated layout with working sidebar navigation
- [ ] Route protection via middleware
- [ ] Login/signup pages functional with better-auth
- [ ] Mobile-responsive sidebar (collapsible drawer on mobile)
- [ ] All routes render placeholder content

---

## Phase 1 — Core CRM

### ISSUE-004: Lead Management

**Priority:** P0 | **Status:** 🟢

Implement lead CRUD, pipeline view, and assignment.

**Features:**
- Leads list page: filterable/sortable table with columns (name, channel, status, assigned agent, created at)
- Pipeline kanban view: drag-and-drop status change across columns (new_lead → contacted → interested → order → delivered, lost)
- Lead detail page: contact info, lead source metadata (click_id, UTM, channel), conversation history, assigned agent, status timeline, linked orders
- Manual lead creation form (for walk-in / non-channel leads)
- Lead assignment: manual by owner/admin; round-robin auto-assignment configurable per business
- Status change: dropdown or drag; logs timestamp + who changed

**Acceptance Criteria:**
- [ ] Leads list with filters (status, channel, agent, date range)
- [ ] Kanban pipeline view with drag-and-drop status update
- [ ] Lead detail page with all metadata visible
- [ ] Manual lead creation
- [ ] Lead assignment (manual + round-robin)
- [ ] All status changes logged with timestamp

---

### ISSUE-005: Unified Inbox

**Priority:** P0 | **Status:** 🟢

Build the central messaging inbox for CS agents.

**Layout:**
- 3-panel: conversation list (left) | message thread (center) | lead context panel (right)
- Conversation list: sorted by last_message_at; badge for unread; filter by channel/status/assigned
- Message thread: bubbles (lead vs agent); timestamps; attachments; quick template selector
- Lead context panel: name, status badge, assigned agent, source info, quick-action buttons (change status, create order, assign)

**Features:**
- Send message via connected channel (initially: webform messages stored in DB)
- Message templates: CRUD in settings; insert via dropdown when composing
- Mark conversation as read/unread
- Filter conversations: by channel, by status, by assigned agent, by unassigned

**Acceptance Criteria:**
- [ ] 3-panel inbox layout with conversation list
- [ ] Message thread with send capability
- [ ] Lead context panel with status/source info
- [ ] Message template insertion
- [ ] Conversation filters working
- [ ] Read/unread state tracking

---

### ISSUE-006: Order Management

**Priority:** P1 | **Status:** 🟢

Implement order creation from leads and order tracking.

**Features:**
- Create order from lead detail page: select product(s) + variant(s) + quantity; auto-calculate total
- Shipping: enter address; select courier (JNE/Sicepat/J&T placeholder for now); calculate cost
- Order list: filterable by status, date, lead, agent
- Order detail: items, pricing, shipping info, tracking number, linked lead
- Order status transitions: pending → processing → shipped → delivered / cancelled
- Auto-notify lead via WhatsApp when order created/shipped (placeholder for now — log the intent)

**Acceptance Criteria:**
- [ ] Order creation from lead page with product selection
- [ ] Auto-calculated total price
- [ ] Order list with filters
- [ ] Order detail with shipping info
- [ ] Status transitions logged

---

### ISSUE-007: Product Management

**Priority:** P1 | **Status:** 🟢

CRUD for products and variants per business.

**Features:**
- Product list page with search/filter
- Create/edit product: name, description, base_price, images (file upload)
- Variants: stored as jsonb array (e.g. `[{name: "Size", options: ["S","M","L"]}]`)
- Activate/deactivate products
- Only visible to business members (owner/admin can manage; agent: read-only)

**Acceptance Criteria:**
- [ ] Product CRUD with variant support
- [ ] Image upload (to Vercel Blob or similar)
- [ ] Active/inactive toggle
- [ ] Role-gated access (agent = read-only)

---

## Phase 2 — Integrations

### ISSUE-008: WhatsApp Business API Integration

**Priority:** P0 | **Status:** 🟢

Connect WhatsApp as a channel for inbound/outbound messaging.

**Requirements:**
- Webhook endpoint (`/api/webhooks/whatsapp`) to receive incoming messages
- Verify webhook with Meta's challenge
- Parse incoming messages → create/update lead → create conversation + message
- Send messages via WhatsApp Business API (text + template messages)
- Store webhook verification token in channel config (encrypted)
- Rate limiting and error handling

**Acceptance Criteria:**
- [ ] Webhook receives and processes incoming WhatsApp messages
- [ ] New WhatsApp contact auto-creates lead with channel=whatsapp
- [ ] Agent can reply from inbox → message sent via WhatsApp API
- [ ] Template messages sent via WhatsApp API
- [ ] Error handling for API failures

---

### ISSUE-009: Instagram DM Integration (Meta Graph API)

**Priority:** P1 | **Status:** 🔴

Connect Instagram as a channel via Meta Graph API.

**Requirements:**
- Webhook endpoint (`/api/webhooks/instagram`) for incoming DMs
- OAuth flow to connect Instagram Business account
- Parse incoming DMs → create/update lead → create conversation + message
- Send DM replies via Meta Graph API
- Handle media attachments (images)

**Acceptance Criteria:**
- [ ] Instagram DMs appear in unified inbox
- [ ] Agent can reply from inbox → DM sent via Instagram
- [ ] OAuth connection flow in settings
- [ ] Media attachments handled

---

### ISSUE-010: TikTok Messaging Integration

**Priority:** P2 | **Status:** 🔴

Connect TikTok as a channel.

**Requirements:**
- Webhook endpoint (`/api/webhooks/tiktok`) for incoming messages
- OAuth flow to connect TikTok Business account
- Parse incoming messages → create/update lead → conversation + message
- Send replies via TikTok Messaging API

**Acceptance Criteria:**
- [ ] TikTok messages appear in unified inbox
- [ ] Agent can reply from inbox
- [ ] OAuth connection flow in settings

---

### ISSUE-011: Web Form Channel

**Priority:** P0 | **Status:** 🟢

Embeddable lead capture form for landing pages.

**Requirements:**
- Form builder in settings: configurable fields (name, phone, email, custom fields)
- Each form generates a unique endpoint (`/api/forms/[formId]/submit`)
- Embeddable via JS snippet or iframe on external sites
- Form submission → auto-create lead with channel=webform
- Spam protection: honeypot + rate limiting
- Form analytics: submission count, conversion rate

**Acceptance Criteria:**
- [ ] Configurable form builder in settings
- [ ] Public submission endpoint
- [ ] Embeddable snippet generated
- [ ] Lead auto-created on submission
- [ ] Spam protection active

---

### ISSUE-012: Conversions API (CAPI) — Meta

**Priority:** P0 | **Status:** 🟢

Send server-side conversion events to Meta Ads.

**Requirements:**
- On lead creation: send `Lead` event to Meta CAPI
- On order creation: send `Purchase` event to Meta CAPI
- Hash PII (email, phone) with SHA-256 before sending
- Include click_id (fbclid) stored on lead for attribution
- Include event_id for deduplication
- Batch events when possible
- Store send status/error for debugging

**Acceptance Criteria:**
- [ ] `Lead` event sent to Meta CAPI on lead creation
- [ ] `Purchase` event sent on order creation
- [ ] PII hashed with SHA-256
- [ ] fbclid included for attribution
- [ ] Error logging for failed sends

---

### ISSUE-013: Conversions API (CAPI) — TikTok

**Priority:** P1 | **Status:** 🔴

Send server-side conversion events to TikTok Ads.

**Requirements:**
- Same pattern as Meta CAPI but for TikTok Events API
- Events: `SubmitForm` (lead) and `CompletePayment` (order)
- Include ttclid for attribution
- SHA-256 hash PII

**Acceptance Criteria:**
- [ ] Events sent to TikTok on lead + order events
- [ ] ttclid included for attribution
- [ ] PII hashed

---

### ISSUE-014: Conversions API — Google Enhanced Conversions

**Priority:** P2 | **Status:** 🔴

Send conversion data to Google Ads.

**Requirements:**
- Google Ads API: Enhanced Conversions for Leads and for Web
- Include gclid from lead for attribution
- SHA-256 hash email/phone

**Acceptance Criteria:**
- [ ] Conversion events sent to Google Ads
- [ ] gclid included for attribution
- [ ] PII hashed

---

### ISSUE-015: Ad Account Management UI

**Priority:** P1 | **Status:** 🟡

Settings UI to connect and manage ad accounts.

**Features:**
- Connect Meta Ad Account: OAuth flow → select ad account → save credentials
- Connect TikTok Ad Account: OAuth flow → select ad account
- Connect Google Ads Account: OAuth flow → select account
- View connected accounts: platform, account name, status (active/disconnected)
- Disconnect account (revoke + delete stored credentials)
- Auto-refresh tokens

**Acceptance Criteria:**
- [ ] OAuth flow for Meta, TikTok, Google
- [ ] Account list with status indicators
- [ ] Disconnect with credential cleanup
- [ ] Token refresh handling

---

### ISSUE-016: Shipping Integration (JNE, Sicepat, J&T)

**Priority:** P2 | **Status:** 🔴

Calculate shipping cost and generate tracking numbers.

**Requirements:**
- Integrate shipping API clients for JNE, Sicepat, J&T
- On order creation: calculate shipping cost based on origin/destination/weight
- Generate tracking number (resi) after order confirmed
- Track shipment status via polling or webhook
- Display tracking info on order detail

**Acceptance Criteria:**
- [ ] Shipping cost calculator in order creation
- [ ] Tracking number generated
- [ ] Shipment status tracked and displayed

---

## Phase 3 — Automation & Intelligence

### ISSUE-017: Automation Rule Engine

**Priority:** P1 | **Status:** 🟡

IF-THEN rule engine configurable per business.

**Triggers:**
- `lead.created` — new lead enters
- `lead.status_changed` — lead status updated
- `lead.no_response` — lead not responded within X minutes
- `order.created` — new order placed
- `order.shipped` — order shipped

**Actions:**
- `send_message` — send template message to lead
- `assign_agent` — assign lead to specific agent
- `change_status` — change lead status
- `notify` — send notification to agent(s)

**Requirements:**
- Rule builder UI: trigger → conditions → action
- Rules evaluated in order; first match executes
- Execution log: which rule, when, result
- Toggle rules active/inactive
- Max rules per business (based on plan)

**Acceptance Criteria:**
- [ ] Rule builder UI in settings
- [ ] Rules execute on configured triggers
- [ ] Multiple actions per trigger supported
- [ ] Execution log visible
- [ ] Active/inactive toggle

---

### ISSUE-018: Lead Intelligence — Click Tracking

**Priority:** P1 | **Status:** 🟢

Capture ad click metadata and attribute leads to specific ads.

**Requirements:**
- Landing page snippet or redirect URL that captures: fbclid/ttclid/gclid, UTM params, IP, user agent, timestamp
- Store click event in `ad_campaign` or dedicated click_log table
- When lead is created (via form/WhatsApp/DM), match to stored click by click_id or IP/UA fingerprint
- Display attribution on lead detail: "Came from Meta Campaign X, Ad Set Y"

**Acceptance Criteria:**
- [ ] Click ID captured on landing page visit
- [ ] Lead matched to click on creation
- [ ] Attribution displayed on lead detail

---

## Phase 4 — Dashboards & Reporting

### ISSUE-019: Dashboard Overview

**Priority:** P1 | **Status:** 🟢

Main dashboard with key business metrics.

**Widgets:**
- Leads this period: total, by channel, trend vs last period
- Revenue this period: total, by product, trend
- Pipeline summary: leads per status (funnel visualization)
- Recent leads: last 10 leads with quick-view
- Agent performance: top agents by closing rate and response time
- Ad performance: cost per lead by campaign (if ad data connected)

**Filters:**
- Date range picker (today, 7d, 30d, 90d, custom)
- Compare to previous period

**Acceptance Criteria:**
- [ ] Dashboard renders with real data from DB
- [ ] Date range filter works
- [ ] Period comparison shows trend arrows
- [ ] Pipeline funnel visualization

---

### ISSUE-020: Ad Performance Report

**Priority:** P2 | **Status:** 🔴

Detailed ad performance breakdown.

**Metrics:**
- Leads per campaign / ad set / ad
- Cost per lead (spend / leads)
- ROAS (revenue from attributed orders / ad spend)
- Conversion rate by campaign
- Channel comparison (Meta vs TikTok vs Google)

**Acceptance Criteria:**
- [ ] Report page with campaign-level metrics
- [ ] Data pulled from ad platform APIs
- [ ] Exportable as CSV

---

### ISSUE-021: Sales Performance Report

**Priority:** P2 | **Status:** 🔴

Sales funnel and team performance.

**Metrics:**
- Pipeline drop-off: % leads at each stage, time between stages
- Closing rate overall, per agent, per channel, per product
- Average deal time (lead → order)
- Revenue by product, by channel, by agent

**Acceptance Criteria:**
- [ ] Funnel visualization with drop-off percentages
- [ ] Agent leaderboard
- [ ] Filterable by period, channel, agent

---

### ISSUE-022: CS Performance Report

**Priority:** P2 | **Status:** 🔴

Agent/CS analytics.

**Metrics:**
- Average first response time per agent
- Leads handled per agent
- Closing rate per agent
- Average conversation length
- Agent availability status

**Acceptance Criteria:**
- [ ] Per-agent metrics displayed
- [ ] Response time tracking
- [ ] Agent comparison view

---

## Phase 5 — Platform & Billing

### ISSUE-023: Team Management

**Priority:** P1 | **Status:** 🟡

Invite and manage team members.

**Features:**
- Team list: name, email, role, status (active/pending), last active
- Invite member: enter email + select role → send invitation email
- Edit role: owner/admin can change member roles
- Remove member: deactivate membership
- Agent scope: agents only see their assigned leads and inbox conversations

**Acceptance Criteria:**
- [ ] CRUD for team members
- [ ] Invitation flow with email
- [ ] Role management
- [ ] Agent data scoping enforced

---

### ISSUE-024: Billing & Plans

**Priority:** P2 | **Status:** 🟡

Subscription management with usage limits.

**Plans:**

| Plan | Members | Channels | Automations | Price |
|---|---|---|---|---|
| Starter | 1 | 1 | 5 | Free |
| Growth | 3 | 3 | 20 | Rp 299K/mo |
| Pro | 10 | 10 | Unlimited | Rp 799K/mo |

**Requirements:**
- Stripe integration for subscriptions
- Usage enforcement: block actions when limit reached
- Upgrade/downgrade flow
- Billing page: current plan, usage, invoices

**Acceptance Criteria:**
- [ ] Stripe checkout for plan selection
- [ ] Usage limits enforced at API level
- [ ] Upgrade/downgrade flow
- [ ] Invoice history

---

### ISSUE-025: Onboarding Flow

**Priority:** P1 | **Status:** 🔴

Guided setup for new businesses.

**Steps:**
1. Create business (auto on signup) — set name + slug
2. Add first product
3. Connect first channel (WhatsApp recommended)
4. Invite team members (optional, skip)
5. Connect ad account (optional, skip)
6. Redirect to inbox

**Acceptance Criteria:**
- [ ] Step-by-step wizard after signup
- [ ] Skippable steps marked optional
- [ ] Completes with functional business ready to receive leads

---

## Issue Dependency Graph

```
ISSUE-001 (DB Schema)
  ├── ISSUE-002 (Auth & RBAC)
  │     └── ISSUE-003 (App Shell)
  │           ├── ISSUE-004 (Lead Management)
  │           │     ├── ISSUE-005 (Unified Inbox)
  │           │     ├── ISSUE-006 (Order Management)
  │           │     └── ISSUE-018 (Click Tracking)
  │           ├── ISSUE-007 (Product Management)
  │           ├── ISSUE-008 (WhatsApp Integration)
  │           │     └── ISSUE-012 (Meta CAPI)
  │           ├── ISSUE-009 (Instagram Integration)
  │           ├── ISSUE-010 (TikTok Integration)
  │           │     └── ISSUE-013 (TikTok CAPI)
  │           ├── ISSUE-011 (Web Form)
  │           ├── ISSUE-014 (Google CAPI)
  │           ├── ISSUE-015 (Ad Account UI)
  │           └── ISSUE-016 (Shipping)
  ├── ISSUE-017 (Automation Engine)
  ├── ISSUE-019 (Dashboard)
  ├── ISSUE-020 (Ad Report)
  ├── ISSUE-021 (Sales Report)
  ├── ISSUE-022 (CS Report)
  ├── ISSUE-023 (Team Mgmt)
  ├── ISSUE-024 (Billing)
  └── ISSUE-025 (Onboarding)
```

## Recommended Build Order

1. **ISSUE-001** → DB schema (everything depends on this)
2. **ISSUE-002** → Auth + RBAC (needed for all protected routes)
3. **ISSUE-003** → App shell + navigation (needed for all pages)
4. **ISSUE-007** → Product management (leads and orders reference products)
5. **ISSUE-004** → Lead management (core entity)
6. **ISSUE-005** → Unified inbox (messaging layer)
7. **ISSUE-006** → Order management (conversion flow)
8. **ISSUE-008** → WhatsApp integration (primary channel for Indonesian UMKM)
9. **ISSUE-012** → Meta CAPI (highest ROI integration)
10. **ISSUE-018** → Click tracking (ad attribution)
11. **ISSUE-011** → Web form channel (capture non-WhatsApp leads)
12. **ISSUE-017** → Automation engine (operational efficiency)
13. **ISSUE-023** → Team management (multi-agent support)
14. **ISSUE-025** → Onboarding flow (new user experience)
15. **ISSUE-019** → Dashboard (reporting)
16. **ISSUE-015** → Ad account UI (connect ad platforms)
17. **ISSUE-009** → Instagram integration
18. **ISSUE-010** → TikTok integration
19. **ISSUE-013** → TikTok CAPI
20. **ISSUE-014** → Google CAPI
21. **ISSUE-016** → Shipping integration
22. **ISSUE-020** → Ad performance report
23. **ISSUE-021** → Sales performance report
24. **ISSUE-022** → CS performance report
25. **ISSUE-024** → Billing & plans
