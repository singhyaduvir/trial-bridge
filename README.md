This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment configuration

Environment variables are required for database access, Supabase integration, and JWT auth.

1. Copy `.env.local.example` to `.env.local`.
2. Fill in your own values for the required secrets.
3. Keep `.env.local` and any actual `.env*` files out of source control.

Required variables:

- `DATABASE_URL` — PostgreSQL connection string used by Prisma.
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL for the browser client.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public anon key for client auth.
- `SUPABASE_URL` — Supabase project URL for server-side admin calls.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key for server-side access.
- `SUPABASE_STORAGE_BUCKET` — Storage bucket name for medical documents (defaults to `medical-documents`).
- `JWT_SECRET` — Strong secret used to sign access tokens.
- `JWT_EXPIRES_IN` — Access token lifetime, e.g. `15m`.
- `REFRESH_TOKEN_SECRET` — Strong secret used to sign refresh tokens.
- `REFRESH_TOKEN_EXPIRES_IN` — Refresh token lifetime, e.g. `7d`.

> For production, set these variables in your deployment platform instead of committing them to Git.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.


