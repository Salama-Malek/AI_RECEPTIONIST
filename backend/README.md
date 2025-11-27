# AI Receptionist Backend

NestJS + Prisma backend for an AI-powered voice receptionist. Modules include telephony webhooks (Twilio/Telnyx), call logging, function-calling tasks, notifications (Telegram/Email), and database access via PostgreSQL.

## Prerequisites
- Node.js 18+
- PostgreSQL database

## Setup
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev --name init
   ```

## Development
```bash
npm run start:dev
```

## Production Build
```bash
npm run build
npm start
```

## Useful Scripts
- `npm run prisma:migrate` — apply migrations in production.
- `npm run prisma:generate` — regenerate Prisma client after schema changes.
- `npm run format` — format source files.

## Module Overview
- **calls**: CRUD for call logs.
- **telephony**: Twilio/Telnyx webhook handlers that record inbound events.
- **tasks**: Stores function-calling/task results tied to calls.
- **notifications**: Sends Telegram or Email notifications.
- **database**: Prisma module with shared `PrismaService`.

## Webhook Endpoints (default port 3000)
- `POST /telephony/twilio/webhook` — Twilio voice webhook (expects JSON).
- `POST /telephony/telnyx/webhook` — Telnyx voice webhook (expects JSON).

## Notes
- Provide your public URL to Twilio/Telnyx (e.g., via ngrok) and set it as the voice webhook.
- Email sending uses SMTP; Telegram uses bot token + chat ID. Both are optional and no-ops when not configured.
