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

## Twilio Media Streams
- Twilio sends JSON frames over WebSocket:
  - `{"event":"start","start":{"streamSid":"<sid>","callSid":"<sid>","accountSid":"<sid>"}}`
  - `{"event":"media","media":{"streamSid":"<sid>","payload":"<base64-ilaw>"}}`
  - `{"event":"stop","stop":{"streamSid":"<sid>"}}`
- The gateway maps each `streamSid` to a session, feeds audio into the STT→LLM→TTS pipeline, and can send audio back via:
  - `{"event":"media","media":{"payload":"<base64-ilaw>"}}` (ensure proper PCMU/8kHz encoding).
- Audio from Twilio is 8kHz mono mu-law (PCMU). Transcoding may be required for your STT/TTS provider (TODO markers in code).

## Environment
- `GATEWAY_PORT` — WebSocket server port.
- `OPENAI_API_KEY` — API key for LLM provider (not required for mock flow).
- `STT_MODEL` — STT model name.
- `TTS_VOICE` — TTS voice to synthesize responses.
- `LOG_LEVEL` — `trace|debug|info|warn|error|fatal`.
- `TWILIO_EXPECTED_ORIGIN` — optional origin check for Twilio WebSocket connections.
- `BACKEND_API_BASE_URL` — URL of the NestJS backend (conversation API).
- `BACKEND_API_TIMEOUT_MS` — timeout in ms for backend calls (default 5000).
- `AI_CONVERSATION_ENABLED` — set to `false` to skip backend calls and only log transcripts.

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
- `src/server/wsServer.ts` manages Twilio Media Stream connections, session lifecycle, message parsing, and cleanup.
- `src/server/sessionManager.ts` holds in-memory sessions keyed by `streamSid`.
- `src/services/audioPipeline.ts` orchestrates STT → LLM → TTS per call with ordered processing.
- `src/services/sttClient.ts` / `llmClient.ts` / `ttsClient.ts` wrap provider calls (currently mocked for offline use).
- `src/config/env.ts` loads and validates environment variables.
- `src/utils/logger.ts` pino-based logger.
- `src/types/messages.ts` defines the WS message schema.

## Backend conversation integration
- Flow: Twilio audio → gateway (STT) → backend `/conversation/start|message` → reply text → TTS → Twilio media stream.
- Configure `BACKEND_API_BASE_URL` and `BACKEND_API_TIMEOUT_MS` for the NestJS backend.
- Toggle with `AI_CONVERSATION_ENABLED=false` to disable backend calls.
- Each Twilio `streamSid` maps to a gateway session; the first caller utterance starts a conversation, subsequent utterances send messages, and replies are synthesized to audio and returned to Twilio.

## Notes
- The current clients provide mock behavior (no external network calls) to keep the service runnable locally. Replace implementations with real provider streaming logic as needed.
- Sessions are cleaned up automatically on WebSocket close; multiple concurrent call sessions are supported.
