# Salama AI Receptionist Dashboard (Frontend)

React + Vite + Tailwind dashboard for monitoring calls, reviewing AI summaries, adjusting settings, and observing live activity.

## Setup
1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend URL.
2. Install dependencies:
   ```bash
   npm install
   ```

## Scripts
- `npm run dev` — start Vite dev server.
- `npm run build` — production build.
- `npm run preview` — preview built app.
- `npm run lint` — run ESLint.

## Pages
- **Login** (`/login`) — placeholder auth form.
- **Call Log** (`/calls`) — list + filters; click row for details.
- **Call Details** (`/calls/:id`) — metadata, transcript, summary, quick status actions.
- **Settings** (`/settings`) — busy mode, working hours, notification channels.
- **Live Monitor** (`/live`) — mock active calls view.

## Styling
- Tailwind CSS with class-based dark mode (`index.html` sets `class="dark"`).
- Global styles in `src/styles/global.css`.

## API
- Axios client uses `VITE_API_BASE_URL`.
- Mock fallbacks are provided when the backend is unreachable for calls and settings.
