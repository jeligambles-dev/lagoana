# Lagoana - Design Document

## Romanian Hunting Equipment Marketplace

**Version:** 1.0
**Date:** 2026-03-29
**Status:** Draft

---

## 1. Vision & Goals

**Lagoana** is a modern, user-friendly classifieds platform for buying and selling hunting equipment in Romania — from firearms and ammunition to optics, clothing, and accessories.

### Core Principles

- **Free to post** — zero barriers to listing. Revenue comes only from optional ad promotion/spotlight.
- **Fast & simple** — a user should be able to register and post their first ad in under 3 minutes.
- **Mobile-first** — most Romanian users browse on their phones. The experience must be excellent on small screens.
- **Modern & trustworthy** — clean design that builds confidence in both buyers and sellers.

### What We Fix vs. Narmao.ro

| Narmao Pain Point | Lagoana Solution |
|---|---|
| Outdated 2010s design, dense navigation | Clean, modern UI with clear visual hierarchy |
| Overwhelming dropdown menus (15+ levels) | Simplified category structure with smart search |
| No real filtering system (relies on Google Custom Search) | Native faceted search with filters (price, location, condition, caliber, etc.) |
| Cluttered layout, poor mobile experience | Mobile-first responsive design |
| Unclear monetization / banner ad clutter | No banner ads. Clean UI. Revenue from optional promoted listings only |
| Basic seller profiles | Rich seller profiles with ratings, history, verification badges |

---

## 2. Users & Roles

### 2.1 User Types

| Role | Description |
|---|---|
| **Visitor** | Can browse and search ads. Cannot contact sellers or post. |
| **Registered User** | Can post ads for free, contact sellers, save favorites, manage their listings. |
| **Verified Seller** | Registered user who has verified their identity. Gets a trust badge. |
| **Admin** | Platform management: moderation, user management, reports, promoted ads management. |

### 2.2 Registration & Authentication

The goal is **minimum friction** login:

- **Email + password** — standard registration with email verification
- **Phone number + SMS OTP** — one-tap login, ideal for Romanian market where phone numbers are universal
- **Google OAuth** — single-click social login
- **Facebook OAuth** — still widely used in Romania
- **Apple Sign-In** — for iOS users

Password recovery via email or SMS.

Session persistence with "remember me" — users should rarely need to re-authenticate.

---

## 3. Information Architecture

### 3.1 Category Structure

A flat, scannable category system (max 2 levels deep):

```
Arme de foc (Firearms)
  ├── Arme cu teava lisă (Smoothbore / Shotguns)
  ├── Arme cu teava ghintuit (Rifled / Rifles)
  ├── Arme scurte (Handguns)
  ├── Arme cu aer comprimat (Air guns)
  └── Arme de colecție / Antice (Collectible / Antique)

Muniție (Ammunition)
  ├── Cartușe alice (Shotshells)
  ├── Cartușe glonț (Rifle/Pistol cartridges)
  ├── Pelete / Alice aer comprimat (Pellets / BBs)
  └── Capsule & componente reîncărcare (Reloading components)

Optică (Optics)
  ├── Lunete (Riflescopes)
  ├── Puncte roșii / Reflex (Red dots / Reflex sights)
  ├── Binocluri (Binoculars)
  ├── Dispozitive vedere nocturnă (Night vision)
  ├── Termoviziune (Thermal)
  └── Telemetrie (Rangefinders)

Cuțite & Unelte (Knives & Tools)
  ├── Cuțite de vânătoare (Hunting knives)
  ├── Cuțite de supraviețuire (Survival knives)
  └── Unelte & accesorii (Tools & accessories)

Arcuri & Arbalete (Bows & Crossbows)

Echipament (Gear & Clothing)
  ├── Îmbrăcăminte (Clothing)
  ├── Încălțăminte (Footwear)
  ├── Rucsaci & genți (Bags & packs)
  └── Camuflaj & accesorii teren (Camo & field gear)

Accesorii arme (Gun accessories)
  ├── Seifuri & securizare (Safes & storage)
  ├── Curățare & întreținere (Cleaning & maintenance)
  ├── Chingi, tocuri, huse (Slings, holsters, cases)
  ├── Bipoduri & suporturi (Bipods & rests)
  └── Alte accesorii (Other accessories)

Câini de vânătoare (Hunting dogs)
  ├── De vânzare (For sale)
  └── De montă (Stud services)

Servicii (Services)
  ├── Fonduri de vânătoare (Hunting grounds)
  ├── Poligoane (Shooting ranges)
  └── Cursuri & autorizări (Courses & licensing)
```

### 3.2 Site Map

```
/                           → Homepage (search, featured, recent ads)
/anunturi                   → Browse all ads (with filters)
/anunturi/:category         → Category listing
/anunturi/:category/:slug   → Single ad detail page
/cont/inregistrare          → Register
/cont/autentificare         → Login
/cont/profil                → My profile / settings
/cont/anunturile-mele       → My ads (manage, edit, renew, delete)
/cont/favorite              → Saved / favorited ads
/cont/mesaje                → Messages / inbox
/publica                    → Post a new ad (simple multi-step form)
/promoveaza                 → Promote / spotlight an ad (paid)
/despre                     → About Lagoana
/termeni                    → Terms & conditions
/contact                    → Contact / support
```

---

## 4. Core Features

### 4.1 Posting an Ad (The Core Loop)

This must be **dead simple**. A 3-step flow:

**Step 1 — What are you selling?**
- Select category (visual icon grid, not a dropdown)
- Title (free text, with character count)
- Description (rich text, with formatting toolbar)
- Condition: Nou / Folosit / Folosit – ca nou (New / Used / Like new)

**Step 2 — Details & Photos**
- Price (RON, with optional "Negociabil" toggle)
- Up to 10 photos (drag & drop, reorder, auto-compress)
- Location (county + city selector, or GPS auto-detect)
- Category-specific fields:
  - Firearms: caliber, manufacturer, year
  - Optics: magnification, reticle type
  - Clothing: size
  - Dogs: breed, age, sex

**Step 3 — Preview & Publish**
- Full preview of how the ad will look
- Publish button
- Option to promote immediately (upsell, but not pushy)

Ads are **live immediately** (with async moderation). If flagged, they go into review.

### 4.2 Search & Discovery

**Search bar** — prominent, always visible in the header. Autocomplete suggestions by category and recent searches.

**Filters panel** (sidebar on desktop, bottom sheet on mobile):
- Category
- Price range (slider + manual input)
- Condition (new / used / like new)
- Location (county, with radius option)
- Posted within (today, 3 days, week, month)
- Category-specific filters (caliber, brand, etc.)

**Sort options:**
- Newest first (default)
- Price: low → high / high → low
- Closest to me (GPS)

**Saved searches** — logged-in users can save a search and get notified (push/email) when new matching ads appear.

### 4.3 Ad Detail Page

Clean layout with:
- **Photo gallery** — swipeable on mobile, lightbox on desktop. Full-screen view.
- **Title, price, condition badge, location**
- **Description**
- **Seller card** — avatar, name, member since, number of ads, rating, verification badge
- **Contact options:**
  - In-app message (primary CTA)
  - Show phone number (click to reveal, tracks impressions)
- **Safety tips** — small banner reminding users to meet in public places, verify permits, etc.
- **Similar ads** — carousel at bottom
- **Report ad** button

### 4.4 User Profile & Dashboard

**My Ads:**
- List of active, expired, and draft ads
- Quick actions: edit, renew (re-post), delete, promote
- Stats per ad: views, favorites, messages received

**My Profile:**
- Avatar, name, bio, location
- Phone number (optional, shown on ads)
- Verification status
- Public profile page visible to other users

**Favorites:**
- Saved ads, organized in a simple list
- Notification if a favorited ad price drops or is about to expire

**Messages:**
- Simple inbox, threaded by ad
- Real-time or near-real-time delivery
- Push notifications for new messages

### 4.5 Seller Verification (Trust & Safety)

Optional but encouraged:
- **Phone verification** — SMS OTP (done at registration)
- **ID verification** — upload government-issued ID, manually reviewed by admin
- **Permit verification** — for firearms sellers, upload valid hunting/weapons permit

Verified sellers get a badge on their profile and ads, boosting buyer confidence.

### 4.6 Moderation & Safety

- **Automated screening** — basic keyword filters for prohibited items, spam patterns
- **User reports** — any user can flag an ad (reasons: scam, prohibited item, incorrect category, offensive content)
- **Admin moderation queue** — flagged ads reviewed within 24h
- **Romanian firearms law compliance** — ads for firearms must include permit-related information; platform terms require valid permits for any transaction
- **Rate limiting** — prevent mass-posting / spam accounts

### 4.7 Admin Panel

A full-featured admin console accessible at `/admin` (role-restricted). All admin actions are logged in an audit trail.

**Dashboard:**
- Overview stats: total users, active ads, ads posted today, pending reports, revenue from promotions
- Quick-access cards to moderation queue, recent reports, flagged ads

**Ad Management:**
- Search/filter all ads by status, category, user, date range
- View any ad's full details
- **Delete ads** — with reason (policy violation, spam, user request). Notifies the seller via email/SMS.
- **Edit ads** — correct category, remove inappropriate images, edit descriptions
- **Bulk actions** — select multiple ads to delete, change status, or move to a different category
- **Feature / unfeature** — manually spotlight an ad (e.g., for partnerships or community events)

**User Management:**
- Search users by name, email, phone
- View user profile, all their ads, messages, and activity history
- **Reset user password** — triggers a password reset email to the user
- **Suspend user** — temporarily disable account (with reason and duration)
- **Ban user** — permanently disable account and remove all their ads
- **Edit user details** — correct email, phone, name if needed
- **Verify / unverify** — manually grant or revoke verification badges (phone, ID, permit)
- **Impersonate user** — view the platform as that user sees it (read-only, for debugging)

**Category Management:**
- **Add new categories** — name (RO), slug, icon, parent category (for subcategories), position/order
- **Edit categories** — rename, reorder, change icons, move under a different parent
- **Delete categories** — with option to migrate existing ads to another category
- **Define category-specific attributes** — set which custom fields appear when posting in that category (e.g., add "caliber" field to a new firearms subcategory)
- **Enable / disable categories** — hide a category without deleting it

**Content Sections (Dynamic Pages):**

Admins can create new sections on the website beyond classifieds — such as blogs, cooking recipes, guides, hunting tips, or any custom content type.

- **Add new section** — name, slug (URL path), type (blog, recipes, custom), description, icon
- **Manage section posts** — create, edit, publish, archive, delete posts within a section
- **Rich text editor** — full WYSIWYG editor for writing posts (headings, images, lists, embeds)
- **Assign authors** — any admin or invited contributor can author posts
- **Section visibility** — enable/disable sections, control navigation placement (header, footer, sidebar)
- **Section ordering** — drag-and-drop to reorder sections in the site navigation

Example sections the admin might create:
- `/blog` — Hunting news, platform updates, community stories
- `/retete` — Cooking recipes for game meat (vânat)
- `/ghiduri` — Guides: how to get a hunting permit, how to choose your first rifle, etc.
- `/legislatie` — Summary of Romanian hunting & firearms laws

Each section gets its own listing page and individual post pages, automatically styled to match the Lagoana design system.

**Reports & Moderation Queue:**
- List of all user-reported ads, sorted by severity/recency
- One-click actions: dismiss report, delete ad, warn user, ban user
- Track resolution status and admin notes per report

**Promotions & Revenue:**
- View all active and past promotions
- Revenue dashboard: daily/weekly/monthly income from promoted ads
- Manually grant free promotions (e.g., for launch incentives)
- Refund a promotion payment

**Site Settings:**
- Homepage hero text and images
- Footer content and links
- Announcement banner (e.g., "Platform maintenance on Sunday 22:00-23:00")
- Toggle features on/off (e.g., disable messaging during maintenance)

**Audit Log:**
- Full history of all admin actions: who did what, when, to which entity
- Filterable by admin user, action type, date range
- Ensures accountability and traceability

---

## 5. Monetization — Promoted Listings

The **only** revenue stream. No banner ads. No listing fees. Clean and simple.

### 5.1 Promotion Options

| Product | What it does | Duration | Price (indicative) |
|---|---|---|---|
| **Anunț promovat (Promoted)** | Ad appears at the top of its category listing with a subtle "Promovat" badge | 7 days | ~15-25 RON |
| **Anunț în spotlight (Spotlight)** | Ad appears in the homepage spotlight carousel + top of category | 7 days | ~30-50 RON |
| **Reîmprospătare (Refresh)** | Bumps the ad back to the top of "newest first" results | Instant | ~5-10 RON |
| **Pachet vânzător (Seller Bundle)** | 5 promotions + 3 spotlights at a discount | 30 days | ~100-150 RON |

### 5.2 Payment

- **Card payment** — Stripe integration (supports Romanian cards)
- **SMS payment** — pay via premium SMS (very popular in Romania for micro-transactions)
- **Bank transfer** — for larger bundles

### 5.3 Promoted Ad UX

- Promoted ads are visually **subtle** — a small badge and priority placement, not garish banners
- Never more than 2-3 promoted ads per page to keep organic results useful
- Clearly labeled as "Promovat" for transparency

---

## 6. Technical Architecture

### 6.1 Tech Stack (Recommended)

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js (React) + TypeScript | SSR for SEO, fast page loads, modern DX |
| **Styling** | Tailwind CSS | Rapid UI development, consistent design system |
| **Mobile** | Responsive web (PWA) | Install-to-homescreen, push notifications, no app store needed initially |
| **Backend / API** | Next.js API routes + tRPC or REST | Co-located with frontend, type-safe |
| **Database** | PostgreSQL | Relational data (users, ads, categories), robust full-text search |
| **Search** | PostgreSQL full-text search → Meilisearch (when scaling) | Start simple, upgrade when needed |
| **File storage** | Cloudflare R2 or AWS S3 | Image hosting, CDN delivery |
| **Image processing** | Sharp (Node.js) | Resize, compress, generate thumbnails on upload |
| **Auth** | NextAuth.js (Auth.js) | Google, Facebook, Apple, email, phone OTP |
| **Realtime / Messages** | WebSockets (Socket.io) or Supabase Realtime | In-app messaging |
| **Payments** | Stripe | Card payments, subscription-like bundles |
| **Hosting** | Vercel (frontend) + managed Postgres (Supabase / Neon) | Low ops overhead, scales automatically |
| **Email** | Resend or Postmark | Transactional emails (verification, notifications) |
| **SMS** | Twilio or local RO provider (e.g., SMSLink.ro) | OTP, notifications |
| **Analytics** | Plausible or PostHog | Privacy-friendly, GDPR-compliant |

### 6.2 Database Schema (Key Entities)

```
users
  id, email, phone, name, avatar_url, bio, county, city,
  is_phone_verified, is_id_verified, is_permit_verified,
  created_at, last_login

ads
  id, user_id, category_id, title, slug, description,
  price, currency, is_negotiable, condition,
  county, city, latitude, longitude,
  status (active, expired, draft, removed),
  views_count, favorites_count,
  promoted_until, spotlight_until,
  created_at, updated_at, expires_at

ad_images
  id, ad_id, url, thumbnail_url, position, created_at

categories
  id, parent_id, name, slug, icon, position

ad_attributes
  id, ad_id, attribute_key, attribute_value
  (e.g., caliber=".308", brand="Sako", magnification="3-12x56")

messages
  id, thread_id, sender_id, receiver_id, ad_id,
  body, is_read, created_at

favorites
  id, user_id, ad_id, created_at

saved_searches
  id, user_id, query, filters_json, notify, created_at

promotions
  id, user_id, ad_id, type (promoted, spotlight, refresh),
  payment_id, starts_at, ends_at, created_at

reports
  id, reporter_id, ad_id, reason, details, status, created_at

sections
  id, name, slug, type (blog, recipes, custom), description,
  is_active, position, created_at

section_posts
  id, section_id, author_id, title, slug, body (rich text/HTML),
  cover_image_url, status (draft, published, archived),
  published_at, created_at, updated_at

admin_audit_log
  id, admin_id, action, target_type, target_id,
  details_json, created_at
```

### 6.3 Key Non-Functional Requirements

- **Page load** — under 2 seconds on 4G mobile
- **Image optimization** — auto WebP conversion, lazy loading, responsive srcset
- **SEO** — server-rendered pages, structured data (Schema.org Product), proper meta tags
- **GDPR compliance** — cookie consent, data export, account deletion, privacy policy
- **Uptime** — 99.9% target
- **Backup** — daily automated database backups
- **Rate limiting** — API rate limits to prevent abuse

---

## 7. UI / UX Design Direction

### 7.1 Visual Identity

- **Colors:** Earthy, natural palette — deep forest greens, warm browns, cream/off-white backgrounds. Accent color: a rich amber/gold for CTAs and highlights.
- **Typography:** Clean sans-serif (e.g., Inter or Nunito) — highly readable, modern, friendly.
- **Imagery style:** High-quality nature/outdoor photography for hero sections. Clean product photography in ads.
- **Logo:** "Lagoana" — elegant but approachable. Could incorporate a subtle hunting motif (antler, crosshair, or oak leaf).

### 7.2 Key Screens

**Homepage:**
```
┌──────────────────────────────────────────────┐
│  [Logo]  [Search.....................] [Login]│
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Hero: "Piața ta de vânătoare"        │  │
│  │  Search bar (large, centered)          │  │
│  │  Popular categories (icon grid)        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Anunțuri în spotlight                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ img  │ │ img  │ │ img  │ │ img  │       │
│  │ title│ │ title│ │ title│ │ title│       │
│  │ price│ │ price│ │ price│ │ price│       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│  Anunțuri recente                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ ...  │ │ ...  │ │ ...  │ │ ...  │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│  [Vezi toate anunțurile →]                   │
│                                              │
│  Footer: About, Terms, Contact, Social       │
└──────────────────────────────────────────────┘
```

**Browse / Search Results:**
```
┌──────────────────────────────────────────────┐
│  [Logo]  [Search.....................] [User] │
│                                              │
│  Filters    │  Results (grid or list toggle) │
│  ┌────────┐ │  Sort: [Newest ▾]              │
│  │Category│ │  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Price   │ │  │ img  │ │ img  │ │ img  │   │
│  │Location│ │  │ title│ │ title│ │ title│   │
│  │Conditi │ │  │ price│ │ price│ │ price│   │
│  │Posted  │ │  │ loc  │ │ loc  │ │ loc  │   │
│  │Brand   │ │  └──────┘ └──────┘ └──────┘   │
│  └────────┘ │  ┌──────┐ ┌──────┐ ┌──────┐   │
│             │  │ ...  │ │ ...  │ │ ...  │   │
│             │  └──────┘ └──────┘ └──────┘   │
│             │  [Load more / pagination]      │
└──────────────────────────────────────────────┘
```

**Post Ad (Step 1 of 3):**
```
┌──────────────────────────────────────────────┐
│  Publică un anunț                            │
│  Step: [1 ●]──[2 ○]──[3 ○]                  │
│                                              │
│  Ce vinzi?                                   │
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │🔫    │ │🎯    │ │🔭    │ │🗡️    │       │
│  │Arme  │ │Munitie│ │Optica│ │Cutite│       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │🏹    │ │🧥    │ │🔧    │ │🐕    │       │
│  │Arcuri│ │Echipm│ │Acces.│ │Caini │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│  Titlu: [________________________]           │
│  Descriere: [                    ]           │
│  Stare:  (●) Nou  (○) Folosit  (○) Ca nou  │
│                                              │
│  [Continuă →]                                │
└──────────────────────────────────────────────┘
```

### 7.3 Mobile Considerations

- Bottom navigation bar: Home, Browse, Post (prominent "+" button), Messages, Profile
- Filters as a slide-up bottom sheet
- Swipeable image galleries
- Large touch targets (min 44px)
- Sticky "Contact seller" button on ad detail page

---

## 8. Legal & Compliance

### 8.1 Romanian Firearms Regulations

- Platform acts as a **classifieds board only** — Lagoana does not sell, buy, or facilitate the transfer of firearms
- All firearms transactions must comply with Romanian Law 295/2004 (weapons and ammunition regime)
- Sellers must hold valid permits; platform terms require this but Lagoana is not responsible for verification of actual transactions
- Clear disclaimers on all firearms-related ads
- Cooperation with authorities when legally required

### 8.2 GDPR / Data Privacy

- Cookie consent banner (granular: necessary, analytics, marketing)
- Privacy policy in Romanian
- Right to data export (JSON/CSV)
- Right to account deletion (full data removal within 30 days)
- Data processing agreement with all third-party services
- Minimal data collection — only what's needed for the platform to function

### 8.3 Platform Terms

- Users must be 18+
- Prohibited: stolen goods, illegal modifications, items without proper documentation
- Platform reserves the right to remove any ad without notice
- Dispute resolution: platform facilitates but is not a party to transactions

---

## 9. Launch Strategy

### Phase 1 — MVP (Month 1-3)
- User registration (email + Google OAuth)
- Post ads (all categories, free)
- Browse & search with basic filters
- Ad detail pages
- Simple messaging between users
- Admin moderation panel
- Mobile-responsive design

### Phase 2 — Growth (Month 3-5)
- Phone OTP login
- Promoted listings (payment integration)
- Saved searches with notifications
- Seller verification (phone + ID)
- Favorites
- Push notifications (PWA)
- SEO optimization

### Phase 3 — Scale (Month 5-8)
- Advanced search (Meilisearch)
- Seller ratings & reviews
- Facebook & Apple OAuth
- SMS payments
- Seller bundles & bulk promotions
- Analytics dashboard for sellers (ad performance)
- Native mobile app consideration (if PWA metrics justify it)

---

## 10. Success Metrics

| Metric | Target (6 months post-launch) |
|---|---|
| Registered users | 5,000+ |
| Active ads | 2,000+ |
| Monthly active users | 10,000+ |
| Avg. time to post an ad | < 3 minutes |
| Promoted ad conversion rate | 5-10% of active sellers |
| Monthly revenue from promotions | Break-even on hosting costs |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Low initial content (chicken & egg) | Seed the platform: invite power sellers from Narmao, offer free spotlight for first 100 ads |
| Legal liability for firearms ads | Strong terms of service, disclaimers, cooperation with authorities, legal counsel review |
| Spam / scam ads | Automated screening + user reporting + manual moderation queue |
| Competitor response (Narmao improves) | Move fast, focus on UX, build community loyalty |
| Payment fraud on promoted ads | Use Stripe's built-in fraud detection |

---

*This is a living document. Update as decisions are made and requirements evolve.*
