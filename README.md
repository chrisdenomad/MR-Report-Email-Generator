# MR Report Email Generator

A browser-only React tool for EPAM Market Research analysts to compose, preview, and copy standardized client-facing email reports.

## Overview

Fill out the form on the left panel and a live email preview updates in real time on the right. The result can be copied as **plain text** or **rich HTML** (Outlook-compatible) and pasted directly into an email client.

No server, no API keys, no backend — everything runs in the browser.

## Features

- **Three research types:** Market Capacity, Salary Benchmark, and Combined
- **Live preview:** Email body mirrors the generated output in real time
- **Rich HTML copy:** Outlook-compatible HTML via the Clipboard API
- **Plain text copy:** Fallback for any email client
- **Templates:** Save, load, and delete up to 10 named form snapshots (persisted to `localStorage`)
- **Auto-save:** Form state is automatically saved to `localStorage` with debounce
- **Dark mode:** Full light/dark theme toggle, persisted across sessions
- **Resizable panels:** Draggable divider between form and preview, position persisted

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool and dev server
- **oxlint** — Fast linter
- **localStorage** — Form state and template persistence
- **Clipboard API** — Rich HTML and plain-text copy

## Deployment

The app is automatically deployed to **GitHub Pages** on every push to `main` via GitHub Actions (`.github/workflows/deploy.yml`).
