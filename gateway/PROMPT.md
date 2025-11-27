You are an expert Node.js, TypeScript, and real-time audio engineer.

Goal:
Create a complete production-ready "voice gateway" service for an AI-powered Receptionist system.

Scope:
ONLY generate code inside the /gateway folder of a monorepo.
Do NOT touch backend or frontend.

Tech stack:
- Node.js
- TypeScript
- WebSocket server
- npm scripts for dev and build

Responsibilities of the gateway:
- Accept a WebSocket connection from the telephony integration (e.g., Twilio/Telnyx media streams or another bridge).
- Receive audio chunks (16 kHz mono PCM / base64-encoded frames).
- Stream audio to an LLM/STT/TTS provider (e.g., OpenAI Realtime API) for:
    - Speech-to-text (caller speech → text)
    - LLM response (text)
    - Text-to-speech (response audio)
- Send synthesized audio chunks back to the telephony side over WebSocket with low latency.
- Maintain a per-call session state (callId, language, conversation history, etc.).

Project structure (inside /gateway):

- package.json
- tsconfig.json
- src/
  - index.ts              (entry point)
  - server/wsServer.ts    (WebSocket server code)
  - config/env.ts         (load and validate env vars)
  - types/
      - messages.ts       (TypeScript interfaces for incoming/outgoing WS messages)
  - services/
      - audioPipeline.ts  (STT → LLM → TTS pipeline orchestration)
      - sttClient.ts      (wrapper for streaming STT client)
      - llmClient.ts      (wrapper for LLM client)
      - ttsClient.ts      (wrapper for TTS client)
  - utils/logger.ts       (simple logger abstraction)
- .env.example            (list required gateway env variables)
- README.md               (how to run gateway, env setup, WS protocol description)

Functional requirements:

1) WebSocket protocol:
   - When a client connects, it sends a JSON config message:
     { "type": "init", "callId": "string", "languageHint": "auto|ar|en|ru" }
   - Audio from telephony is sent as:
     { "type": "audio", "callId": "string", "chunk": "base64-encoded-PCM" }
   - When the pipeline emits audio back to caller:
     { "type": "audio_out", "callId": "string", "chunk": "base64-encoded-PCM" }
   - Text subtitles/logging (optional):
     { "type": "transcript", "callId": "string", "role": "caller|assistant", "text": "..." }

2) The gateway must:
   - Be able to handle multiple concurrent calls/sessions.
   - Clean up session state when WS connection closes.
   - Handle errors robustly and log them clearly.

3) Environment variables in .env.example (with comments):
   - GATEWAY_PORT
   - OPENAI_API_KEY (or generic LLM provider key)
   - STT_MODEL
   - TTS_VOICE
   - LOG_LEVEL

4) Implement basic but realistic logic in:
   - audioPipeline.ts:
       - Receive audio frames
       - Buffer/stream them to STT
       - Send text to LLM
       - Stream TTS back to client

5) Provide npm scripts in package.json:
   - "dev": ts-node-dev or nodemon for src/index.ts
   - "build": tsc
   - "start": node dist/index.js

Output:
- Full code for ALL files listed above.
- TypeScript must compile.
- No placeholders for file paths. Provide concrete imports.
- Do not generate any other folders outside /gateway.
