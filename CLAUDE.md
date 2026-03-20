# kangwon-food-platform

## Project Overview
K-Food restaurant management platform for "강원" (Kangwon), operated by 강원푸드 under iCAN.
Philippines-based Korean restaurant with Korean staff direct serving.

## Architecture
- **Monorepo**: Turborepo with npm workspaces
- **Apps**: web (manager, :3000), tablet (customer order, :3001), kitchen (KDS, :3002), api (Hono, :4000)
- **Packages**: db (Drizzle/PostgreSQL), shared (types/constants/i18n), ai (Claude+Gemini), ontology (entity graph)

## Tech Stack
- Frontend: Next.js 15, React 19, Tailwind CSS 4, Zustand
- Backend: Hono.js, Drizzle ORM, PostgreSQL, SSE for realtime
- AI: Claude API (sentiment/strategy), Gemini (receipt OCR)
- Currency: PHP (Philippine Peso)

## Key Commands
- `docker compose up -d` — Start PostgreSQL + Redis
- `npm run dev` — Start all apps via Turborepo
- `npm run db:generate && npm run db:migrate` — DB migrations
- `npm run db:seed` — Seed initial data (menu, staff, tables, OKR)

## Naming
- Restaurant name: 강원 (KANGWON)
- Company name: 강원푸드
- Service modes: counter (국대떡볶이 style), table_tablet, staff_order
- Korean staff serve directly (한국인 직접 서빙)

## Serving Guide
See `docs/K-FOOD-SERVING-GUIDE.md` for full Korean serving system documentation.
