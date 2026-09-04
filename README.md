# AI Receptionist

An AI-powered voice receptionist that answers calls, holds a conversation, acts on what
it is told, and hands off to a human when something needs one.

The system is split into three services: a voice gateway that bridges telephony audio
to an STT -> LLM -> TTS pipeline, a NestJS backend that runs the conversation logic and
persists call data, and a React dashboard for monitoring calls and adjusting settings.
The conversation module is not just transcribing — it runs function-calling against a
task layer, so a call can create a record, schedule something, or trigger a
notification while it is still in progress.

## Features

- Inbound call handling for Twilio and Telnyx webhooks, including TwiML responses that
  start a media stream to the gateway
- WebSocket audio bridge (voice gateway) mapping each Twilio `streamSid` to a call
  session, feeding audio through an STT -> LLM -> TTS pipeline
- Conversation engine with function-calling: the model can invoke tasks (e.g. create a
  record, schedule something) mid-call, tracked as `TaskResult` rows tied to the call
- Text-mode conversation API (`/conversation/start`, `/conversation/message`) for
  exercising the AI receptionist without audio, useful for debugging call flow
- Call logging with transcript, summary, metadata, and status history
  (`RECEIVED` -> `RINGING` -> `IN_PROGRESS` -> `COMPLETED`/`FAILED`)
- Human hand-off notifications over Telegram and Email, both optional and no-ops when
  unconfigured
- Dashboard for call log browsing, call detail/transcript review, live call monitoring,
  and receptionist settings (busy mode, working hours, notification channels)
- Request validation at every boundary via `class-validator` DTOs and a global
  exception filter, so malformed telephony payloads are rejected at the edge

## Tech stack

**Backend** (`backend/`): NestJS, TypeScript, Prisma, PostgreSQL, Twilio SDK,
`class-validator`, `nodemailer`, `node-telegram-bot-api`

**Voice gateway** (`gateway/`): Node.js, TypeScript, `ws` (WebSocket server), `zod`,
`pino`, `axios` — pluggable STT/LLM/TTS provider clients (currently mocked for offline
development)

**Frontend** (`frontend/`): React 18, Vite, TypeScript, Tailwind CSS, React Router,
Axios

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL database (for the backend)

### Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL and provider credentials
npm run prisma:generate
npm run prisma:migrate:dev --name init
npm run start:dev           # http://localhost:3000
```

Production build: `npm run build && npm start`.
Other scripts: `npm run lint`, `npm run format`, `npm run prisma:migrate` (deploy).

### Voice gateway

```bash
cd gateway
npm install
cp .env.example .env
npm run dev                 # ws://localhost:4000 (default GATEWAY_PORT)
```

Production build: `npm run build && npm start`.

Key environment variables: `GATEWAY_PORT`, `OPENAI_API_KEY` (LLM provider, not required
for the mock flow), `STT_MODEL`, `TTS_VOICE`, `LOG_LEVEL`, `TWILIO_EXPECTED_ORIGIN`,
`BACKEND_API_BASE_URL`, `BACKEND_API_TIMEOUT_MS`, `AI_CONVERSATION_ENABLED`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # set VITE_API_BASE_URL to the backend URL
npm run dev                  # http://localhost:5173
```

Production build: `npm run build`, preview with `npm run preview`.
Lint: `npm run lint`.

### Testing

No test scripts are currently defined in any of the three packages.

## Project structure

```
backend/
  prisma/schema.prisma       # CallLog, TaskResult, Notification models
  src/
    telephony/                # Twilio/Telnyx webhook handlers
    conversation/              # AI client, system prompts, function calling
      ai/                       # AI client service and types
    tasks/                     # actions the model can invoke during a call
    calls/                     # call records and logging
    notifications/             # Telegram and email hand-off
    database/                  # Prisma service
    common/                     # global exception filter, validation pipe

gateway/
  src/
    server/                    # WebSocket server, session manager
    services/                   # audioPipeline, sttClient, llmClient, ttsClient
    config/, types/, utils/

frontend/
  src/
    pages/                      # Login, CallLog, CallDetails, Settings, LiveMonitor
    components/                 # layout (Sidebar, TopBar, MainLayout) and ui primitives
    api/                        # Axios client, calls and settings endpoints
    router/, hooks/, styles/, types/
```

Each service also has its own README with detailed setup, environment variables, and
API documentation: [`backend/README.md`](backend/README.md),
[`gateway/README.md`](gateway/README.md), [`frontend/README.md`](frontend/README.md).

## Status

Working backend, gateway, and dashboard. Not a hosted product — telephony provider
credentials (Twilio/Telnyx) and STT/LLM/TTS provider integrations are yours to supply;
the gateway's provider clients are currently mocked for offline development.
