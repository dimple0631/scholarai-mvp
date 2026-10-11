# ScholarAI MVP — Phase 1 starter

This is a working, responsive **front-end prototype** aligned to the ScholarAI MVP Specification v2.0 and Tech Plan. It is intentionally a prototype: it uses illustrative local demo data and browser `localStorage`, not real authentication, Supabase persistence, verified catalogue data, email delivery, or payments.

## Included now

- Dashboard and next-action checklist
- University/program discovery with search and filters
- Save/remove programs and scholarships
- Shortlist view
- Editable affordability scenario UI
- Application tracker with status changes and task checkboxes
- Student profile wizard
- Free / Standard / Premium plan comparison (demo-only switching; no payment)
- Responsive desktop/mobile layout
- Initial Supabase schema and row-level security draft at `supabase/migrations/0001_initial_schema.sql`

## Run locally

Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Important before real launch

1. Demo program and scholarship entries are **not verified records**. They must be reviewed against official pages and replaced with source-backed data before public launch. Some scholarship records are explicitly placeholders, not confirmed awards.
2. The budget calculator currently displays demo values and does not perform live FX conversion. Do not use it for real financial decisions.
3. Local storage is only for this browser/device and is not suitable for private documents or multi-device accounts.
4. Authentication, Supabase database calls, secure file storage, server-enforced plan entitlements, email reminders, payment provider integration, admin catalogue workflows, and data export/deletion still need implementation and testing.
5. Review the SQL migration and RLS policies before applying them to a production Supabase project. Use a trusted server role for admin writes and billing updates. Never expose a Supabase service-role key in client code.
6. Do not sell features that are not implemented. Pricing buttons in this prototype only change the demo plan locally.

## Recommended next build order

1. Review and apply the database schema in a development Supabase project.
2. Implement Supabase Auth and profiles.
3. Replace localStorage state with user-scoped database queries and test RLS.
4. Import manually verified programs and scholarships, each with official source and verification date.
5. Implement deterministic eligibility states and explainable matching.
6. Implement validated cost maths and dated FX source before publishing budget conclusions.
7. Build deadline-based plans and server-side email reminders.
8. Add secure plan entitlements and payment integration only after beta validation.

## Tech stack

Next.js App Router, React, TypeScript, Lucide icons, CSS, and a Supabase SQL schema draft.
