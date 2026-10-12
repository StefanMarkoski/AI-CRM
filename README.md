# CRM AI — MVP (frontend only)

A clickable presentation MVP built with **React Native + Expo** (Expo Router, TypeScript).
It runs in the browser, on tablets, and on phones from the same code. All data is mocked in memory.

## Run

```bash
npm install
npm run web        # opens http://localhost:8081/AI-CRM/
npm run android    # or scan the QR code with Expo Go
npm run typecheck
```

## Live demo

Deployed to GitHub Pages on every push to `main` (see `.github/workflows/deploy-pages.yml`):
https://stefanmarkoski.github.io/AI-CRM/

Because of the Pages subpath, `app.json` sets `experiments.baseUrl` to `/AI-CRM`,
so the local dev server also serves the app at `http://localhost:8081/AI-CRM/`.

## Structure

```
src/
  app/            routes (one file = one screen) + _layout.tsx (sidebar shell)
  components/     Sidebar, Screen header, TaskRow, sheets, AI drawer, search palette
  data/mock.ts    demo data, generated relative to today so the demo always looks current
  store/          crm.tsx (data + actions), ui.tsx (overlays)
  theme/          colors (taken from the mockups), type scale, spacing
  utils/          date helpers, mockAI.ts (scripted assistant replies)
```

## What's interactive

- Dashboard: stat cards link to their screens, tick off today's tasks, activities open the client
- Clients: search + status filter, create / edit / delete, add notes and tasks
- Tasks: today / upcoming / overdue / completed, edit, delete, mark complete
- Calendar: week navigation, click an empty hour to add a task, Schedule Mail from a template
- Templates: create / edit / delete, Send Mail with a live preview
- **Ask AI** drawer on every screen with suggestions for that screen (scripted, no backend)
- Global search (Search pill or Ctrl/⌘+K), Notifications, Settings
