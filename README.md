# Founder OS — AI Co-Founder for Web3 Startups

Your AI co-founder that guides web3 founders from idea to investor pitch across 13 stages.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **AI**: Anthropic Claude (Sonnet 4)
- **Auth**: Clerk
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Rate Limiting**: Upstash Redis
- **Styling**: Tailwind CSS v4 + shadcn (base-nova)
- **Export**: PDF + PPTX generation

## Getting Started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

3. Push the database schema:

```bash
npx prisma db push
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables from `.env.local.example`
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Deploy — Prisma generates automatically via the build command

## 13 Stages

1. Ideation → 2. Validation → 3. Stress Test → 4. Lean Canvas → 5. Selection → 6. MVP → 7. Mafia Offer → 8. Build → 9. Launch → 10. Feedback → 11. Pitch → 12. Token Launch → 13. Decision

## Features

- AI-guided conversations across all 13 startup stages
- Stress test scoring (7 dimensions)
- Lean Canvas auto-fill
- Sprint tracking with customer discovery
- Pitch deck generation (10 sections)
- Token launch planning
- PDF & PPTX export
- Health score system (0-100 with grade)
- Advisor share links
- Multi-project comparison
- Full data export

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
