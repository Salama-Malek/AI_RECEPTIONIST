# Voice Gateway

WebSocket-based audio bridge for the AI Receptionist. Handles low-latency streaming between telephony media (e.g., Twilio/Telnyx) and an STT → LLM → TTS pipeline.

## Prerequisites
- Node.js 18+

## Setup
1. Copy `.env.example` to `.env` and set values.
2. Install dependencies:
   ```bash
   npm install
   ```

## Run
```bash
npm run dev      # watch mode
npm run build    # compile to dist
npm start        # run compiled server
```

The WebSocket server listens on `GATEWAY_PORT` (default 4000).

## Environment
- `GATEWAY_PORT` — WebSocket server port.
- `OPENAI_API_KEY` — API key for LLM provider (not required for mock flow).
- `STT_MODEL` — STT model name.
- `TTS_VOICE` — TTS voice to synthesize responses.
- `LOG_LEVEL` — `trace|debug|info|warn|error|fatal`.

## WebSocket Protocol
Messages are JSON:
- Client → Server:
  - `{"type":"init","callId":"<uuid>","languageHint":"auto|ar|en|ru"}`
  - `{"type":"audio","callId":"<uuid>","chunk":"<base64-PCM-16k-mono>"}`
- Server → Client:
  - `{"type":"ready","callId":"<uuid>"}`
  - `{"type":"audio_out","callId":"<uuid>","chunk":"<base64-PCM>"}`
  - `{"type":"transcript","callId":"<uuid>","role":"caller|assistant","text":"..." }`
  - `{"type":"error","callId":"<uuid>","message":"..." }`

## Architecture
- `src/index.ts` boots the WebSocket server.
- `src/server/wsServer.ts` manages connections, sessions, message parsing, and cleanup.
- `src/services/audioPipeline.ts` orchestrates STT → LLM → TTS per call with ordered processing.
- `src/services/sttClient.ts` / `llmClient.ts` / `ttsClient.ts` wrap provider calls (currently mocked for offline use).
- `src/config/env.ts` loads and validates environment variables.
- `src/utils/logger.ts` pino-based logger.
- `src/types/messages.ts` defines the WS message schema.

## Notes
- The current clients provide mock behavior (no external network calls) to keep the service runnable locally. Replace implementations with real provider streaming logic as needed.
- Sessions are cleaned up automatically on WebSocket close; multiple concurrent call sessions are supported.
