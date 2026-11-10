# Internship Tracker

Track internship applications, follow-ups and offers. React + Vite + TypeScript + Tailwind CSS.
Everything is saved in your browser's localStorage, with no account and no server.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev        # open http://localhost:5173
```

Build a production copy:

```bash
npm run build      # output goes to dist/
npm run preview    # check the build locally
```

## Your data

- Data lives in the browser you use, so your laptop and phone each keep their own list.
- To move data between devices, open the drive icon in the top bar, choose **Export backup (JSON)**, send the file to
  the other device, and pick **Import backup** there. Import merges by ID, so importing the same file twice
  does not create duplicates.
- Clearing your browser's site data deletes the list, so export now and then.

## Deploy free on Vercel

1. Push this folder to a GitHub repository.
2. Go to vercel.com, sign in with GitHub, click **Add New → Project**, and pick the repo.
3. Vercel detects Vite. Leave the defaults (build `npm run build`, output `dist`) and click **Deploy**.

Every push to `main` redeploys automatically.

## Deploy free on GitHub Pages

A workflow is already included at `.github/workflows/deploy.yml`.

1. Push this folder to a GitHub repository (branch `main`).
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push again (or run the workflow from the **Actions** tab). The site appears at
   `https://<your-username>.github.io/<repo-name>/`.

`vite.config.ts` uses `base: './'`, so the build works under any sub-path without changes.

## Project layout

```
src/
  App.tsx                 state, filtering, sorting, import/export
  types.ts                Application type, statuses, sort options
  lib/format.ts           Malaysian date format, RM formatting, day counts
  lib/storage.ts          localStorage (wrapped in try/catch) and data validation
  lib/sample.ts           the three example applications shown on first launch
  components/             Header, Pipeline, FollowUps, AppCard, StatusMenu, EditDialog, Toasts, EmptyState
```
