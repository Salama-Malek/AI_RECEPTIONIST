You are an expert React, TypeScript, and Vite developer.

Goal:
Create a complete, production-ready frontend dashboard for an AI-powered Receptionist system.

Scope:
ONLY generate code inside the /frontend folder of a monorepo.
Do NOT touch /backend or /gateway.

Tech stack:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

App name:
- "Salama AI Receptionist Dashboard"

Project structure (inside /frontend):

- package.json
- tsconfig.json
- vite.config.ts
- index.html
- postcss.config.cjs or postcss.config.js
- tailwind.config.cjs or tailwind.config.js
- src/
  - main.tsx
  - App.tsx
  - router/
      - index.tsx
  - pages/
      - LoginPage.tsx
      - CallLogPage.tsx
      - CallDetailsPage.tsx
      - SettingsPage.tsx
      - LiveMonitorPage.tsx
  - components/
      - layout/
          - MainLayout.tsx
          - Sidebar.tsx
          - TopBar.tsx
      - ui/
          - Button.tsx
          - Card.tsx
          - Input.tsx
          - Select.tsx
          - Badge.tsx
          - Table.tsx
  - api/
      - client.ts       (Axios instance)
      - calls.ts        (API functions for call log, call details)
      - settings.ts     (API functions for settings)
  - hooks/
      - useBusyMode.ts
  - types/
      - call.ts
      - settings.ts
  - styles/
      - global.css      (import Tailwind base/components/utilities)

Functional requirements:

1) Routing (React Router):
   - "/" → redirect to "/calls"
   - "/login" → LoginPage
   - "/calls" → CallLogPage
   - "/calls/:id" → CallDetailsPage
   - "/settings" → SettingsPage
   - "/live" → LiveMonitorPage

2) Pages:
   - LoginPage:
       - Simple login form (email, password, submit)
       - No real auth logic, just a placeholder.

   - CallLogPage:
       - Table of calls: date/time, caller name, number, status, urgency.
       - Ability to filter by date range and urgency.
       - Clicking a row navigates to CallDetailsPage.

   - CallDetailsPage:
       - Shows:
           - Call metadata (caller name, number, timestamps, urgency).
           - Transcript (list of utterances: caller vs assistant).
           - AI summary (short text).
       - Buttons:
           - "Mark as handled"
           - "Mark as spam"
           - "Back to list"

   - SettingsPage:
       - Busy mode toggle (on/off).
       - Working hours (start/end time).
       - Notification channels (checkboxes: Telegram, Email).
       - Save button to call backend settings API.

   - LiveMonitorPage:
       - Placeholder UI for active calls:
           - List of "active calls" with callId, caller, duration.
           - This can use mock data for now.

3) API client:
   - Use Axios.
   - Base URL configurable via environment variable:
       - VITE_API_BASE_URL
   - Implement mock functions or typed functions that expect backend endpoints like:
       - GET /calls
       - GET /calls/:id
       - PATCH /calls/:id/status
       - GET /settings
       - PATCH /settings

4) Tailwind:
   - Configure Tailwind with base, components, utilities.
   - Use a clean, minimal dashboard style.
   - Dark-mode support via class strategy (e.g. "class" mode).

5) Components:
   - MainLayout: sidebar + top bar + content area.
   - Sidebar: navigation links to Calls, Settings, Live Monitor.
   - TopBar: app title + user avatar placeholder.
   - Reusable UI components (Button, Card, Input, Select, Table, Badge) used across pages.

6) Scripts in package.json:
   - "dev": Vite dev server
   - "build": Vite build
   - "preview": Vite preview
   - "lint": ESLint (optional, but include basic config if you add it)

Output:
- Full code for ALL files listed.
- TypeScript must compile.
- Tailwind must be wired correctly (index.html and main.tsx).
- Do not generate files outside /frontend.
