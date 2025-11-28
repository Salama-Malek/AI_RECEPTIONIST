You are an expert React + TypeScript + Vite + Tailwind engineer.

Goal:
Upgrade the existing "Salama AI Receptionist Dashboard" frontend to:
1) Use real backend APIs for calls and conversations (where available).
2) Provide a more useful Call Log and Call Details UX.
3) Make the Live Monitor page show active calls (using mock polling or WebSocket-ready structure).

Scope:
ONLY modify/add code inside /frontend.

Assumptions:
- Current structure (adapt to actual file names if needed):
  - src/
    - main.tsx
    - App.tsx
    - router/index.tsx
    - pages/
      - CallLogPage.tsx
      - CallDetailsPage.tsx
      - SettingsPage.tsx
      - LiveMonitorPage.tsx
    - api/
      - client.ts
      - calls.ts
      - settings.ts
    - types/
      - call.ts
      - settings.ts
    - components/
      - layout/
      - ui/
  - Backend exposes endpoints similar to:
    - GET /calls
    - GET /calls/:id
    - PATCH /calls/:id/status
    - GET /conversation/:conversationId (or conversation info included with call details)
- Base API URL must come from env: import.meta.env.VITE_API_BASE_URL.

=== Requirements ===

1) API client layer

Update src/api/client.ts:
- Use Axios instance configured with:
  - baseURL = import.meta.env.VITE_API_BASE_URL
  - timeout = 10000 ms (or similar)
- Add basic interceptors for logging errors (console or simple alerts).

Update or create src/api/calls.ts:
- export async function fetchCalls(): Promise<CallSummary[]>
- export async function fetchCallById(callId: string): Promise<CallDetails>
- export async function updateCallStatus(callId: string, status: 'handled' | 'spam' | 'open'): Promise<void>

Define/extend types in src/types/call.ts:
- CallSummary:
    - id: string
    - callSid?: string
    - fromNumber: string
    - callerName?: string
    - startedAt: string
    - durationSeconds?: number
    - status: 'open' | 'handled' | 'spam'
    - urgency: 'low' | 'medium' | 'high'
- CallDetails:
    - id: string
    - same fields as CallSummary +
    - transcript: Array<{
        id: string;
        role: 'caller' | 'assistant';
        text: string;
        timestamp: string;
      }>
    - summary?: string
    - notes?: string

If backend endpoints are not exactly known, keep URLs and types in one place so they can easily be adjusted.

2) Call Log page improvements

Update src/pages/CallLogPage.tsx:

- On mount, call fetchCalls() and show:
  - Loading state.
  - Error state.
  - A table with:
      - Date/Time
      - Caller name or number
      - Status
      - Urgency
      - Duration (if available)
- Add:
  - A basic filter bar above the table:
      - Status filter (All / Open / Handled / Spam)
      - Urgency filter (All / Low / Medium / High)
  - Clicking a row navigates to `/calls/:id`.

Use existing UI components (Card, Table, Badge, etc.) for a clean layout.

3) Call Details page improvements

Update src/pages/CallDetailsPage.tsx:

- Read :id from router params.
- On mount, call fetchCallById(id).
- Show sections:
  - Header: caller name/number, status badge, urgency badge, time + duration.
  - "Summary" card: summary text (or placeholder if missing).
  - "Transcript" card:
      - Display messages chronologically.
      - Distinguish caller vs assistant visually (different badge or alignment).
  - "Actions" area:
      - Buttons:
        - "Mark as handled" → updateCallStatus(id, 'handled')
        - "Mark as spam" → updateCallStatus(id, 'spam')
        - "Back to Calls" → navigate back to list.

- Handle loading/error states gracefully.

4) Live Monitor page for active calls

Update src/pages/LiveMonitorPage.tsx:

- Implement a simple polling mechanism (setInterval) or a mocked hook to simulate active calls.
  - For now, you may:
    - Use a hook useActiveCalls() that returns a list of active calls with:
        - id
        - callerName / fromNumber
        - connectedAt
        - durationSeconds (incremented on the client)
        - status: 'active'
  - Or prepare it to call a future endpoint like GET /calls/active.

- UI:
  - Show a Card listing:
      - Active calls count.
      - Table/grid of active calls with duration live-updated.
  - Optionally show a small indicator "LIVE" (badge) on each active call row.
  - Clicking an active call row navigates to its CallDetails page (by id), if that makes sense in your data model.

5) Layout and navigation polish

- Ensure the sidebar navigation clearly highlights:
  - Calls
  - Live Monitor
  - Settings
- Make sure routes:
  - "/calls" → CallLogPage
  - "/calls/:id" → CallDetailsPage
  - "/live" → LiveMonitorPage

6) Error & empty states

- In CallLogPage:
  - If there are no calls, show a friendly empty state message and a hint that calls will appear once the AI Receptionist handles real calls.
- In CallDetailsPage:
  - If call not found, show a "Call not found" message instead of crashing.

7) Tailwind / styling

- Use Tailwind classes to keep everything consistent with a clean dashboard look.
- Make sure everything works in light mode by default; if you already have dark mode toggle via class, keep it compatible.

Constraints:

- Use TypeScript everywhere.
- Keep all imports and paths correct.
- Do not break existing routes and components.
- You can create additional small components if needed in components/ui/ or components/layout/.
