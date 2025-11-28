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
- `npm run prisma:migrate` - apply migrations in production.
- `npm run prisma:generate` - regenerate Prisma client after schema changes.
- `npm run format` - format source files.

## Module Overview
- **calls**: CRUD for call logs.
- **telephony**: Twilio/Telnyx webhook handlers that record inbound events.
- **tasks**: Stores function-calling/task results tied to calls.
- **notifications**: Sends Telegram or Email notifications.
- **database**: Prisma module with shared `PrismaService`.
- **conversation**: AI receptionist brain (text-only endpoint for debugging the call flow).

## Webhook Endpoints (default port 3000)
- `POST /telephony/incoming` - Twilio Voice webhook (form-encoded). Returns TwiML that starts a media stream to the gateway.
- `POST /telephony/status` - Twilio status callbacks (form-encoded).
- `POST /telephony/twilio/webhook` - Twilio media events (JSON).
- `POST /telephony/telnyx/webhook` - Telnyx voice webhook (JSON).

Example TwiML returned by `/telephony/incoming`:
```xml
<Response>
  <Say>Connecting you to Salama's AI assistant. Please hold.</Say>
  <Connect>
    <Stream url="wss://gateway.example.com/stream">
      <Parameter name="callId" value="abc123" />
      <Parameter name="callSid" value="CAxxxx" />
    </Stream>
  </Connect>
</Response>
```

Example curl (mimic Twilio form POST):
```bash
curl -X POST http://localhost:3000/telephony/incoming \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551234567&To=%2B18005550123&CallSid=CA123"
```

## Conversation API (text-mode debugging)
These endpoints let the gateway or frontend exercise the AI receptionist without audio.

- `POST /conversation/start`
  - Body:
    ```json
    {
      "callerName": "Amira Hassan",
      "phoneNumber": "+971501234567",
      "languageHint": "auto",
      "context": "VIP caller, prefers mornings"
    }
    ```
  - Response:
    ```json
    {
      "conversationId": "uuid",
      "initialAssistantMessage": "Hello, this is Salama AI Receptionist...",
      "meta": { "languageHint": "auto", "timestamp": "2025-01-01T12:00:00.000Z" }
    }
    ```

- `POST /conversation/message`
  - Body:
    ```json
    {
      "conversationId": "uuid",
      "from": "caller",
      "text": "I need to schedule an appointment tomorrow"
    }
    ```
  - Response:
    ```json
    {
      "reply": "Thanks, I can help. How urgent is it and what time works?",
      "actions": [{ "type": "create_task", "payload": { "notes": "Scheduling intent" } }],
      "updatedSummary": "Scheduling intent"
    }
    ```

## Notes
- Provide your public URL to Twilio/Telnyx (e.g., via ngrok) and set it as the voice webhook.
- Email sending uses SMTP; Telegram uses bot token + chat ID. Both are optional and no-ops when not configured.
