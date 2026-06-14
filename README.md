# Daybook

A task organizer for academics, work, coding, and life — with a Postgres
database on [Neon](https://neon.tech) and serverless API functions on
[Vercel](https://vercel.com).

## Project structure

```
daybook/
├── api/
│   ├── tasks.js          GET (list) and POST (create) tasks
│   └── tasks/
│       └── [id].js       PATCH (update/toggle) and DELETE a task
├── public/
│   ├── index.html        the app (frontend)
│   ├── favicon.svg / .ico / favicon-32.png / apple-touch-icon.png
├── schema.sql             run once to create the tasks table
├── package.json
├── vercel.json
└── .env.example
```

## 1. Create the Neon database

1. Sign up / log in at [neon.tech](https://neon.tech) and create a new project.
2. Open the **SQL Editor** for your project and run the contents of `schema.sql`
   (this creates the `tasks` table).
3. Go to **Connection Details** and copy the **pooled connection string**
   (it looks like `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`).
   Using the pooled connection is important for serverless functions.

## 2. Deploy to Vercel

You can deploy via the Vercel dashboard or CLI.

### Option A — Vercel dashboard
1. Push this project to a GitHub repo.
2. In Vercel, click **Add New Project** and import the repo.
3. Before deploying, go to **Settings → Environment Variables** and add:
   - `DATABASE_URL` = the pooled connection string from Neon
4. Deploy.

### Option B — Vercel CLI
```bash
npm i -g vercel
cd daybook
vercel
# follow the prompts, then add the env var:
vercel env add DATABASE_URL
# paste your Neon pooled connection string when prompted
vercel --prod
```

## 3. Local development (optional)

```bash
npm install
cp .env.example .env
# edit .env and paste your DATABASE_URL
npx vercel dev
```

This serves the frontend and the `/api` functions together at
`http://localhost:3000`, using your Neon database.

## How it works

- The frontend (`public/index.html`) calls `/api/tasks` for all data —
  there is no `localStorage` involved anymore, so your tasks persist across
  devices and browsers as long as they hit the same deployment.
- `api/tasks.js` handles listing all tasks (`GET`) and creating a new one
  (`POST`).
- `api/tasks/[id].js` handles toggling completion or editing a task
  (`PATCH`) and removing one (`DELETE`).
- There's no login — this is a single shared task list, intended for
  personal use.

## Favicon

The favicon is served from `public/favicon.svg` (modern browsers),
with `favicon.ico`, `favicon-32.png`, and `apple-touch-icon.png` as
fallbacks for older browsers, Safari pinned tabs, and iOS home screen
icons. Vercel serves everything in `public/` from the site root, so
`/favicon.ico` etc. resolve correctly once deployed — no extra config
needed.
