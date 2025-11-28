You are an expert Node.js + TypeScript engineer with deep experience in Twilio Media Streams and WebSockets.

Goal:
Refine and adapt the existing /gateway service to work correctly with Twilio Voice Media Streams, acting as the bridge between Twilio's WebSocket and the AI audio pipeline (STT → LLM → TTS).

Scope:
ONLY modify/add code inside /gateway. 
Do NOT touch /backend, /frontend, or /infra.

Assume current structure (adjust to the real code if needed, but keep it consistent):

- gateway/
  - package.json
  - tsconfig.json
  - src/
      - index.ts
      - server/wsServer.ts
      - config/env.ts
      - types/messages.ts
      - services/audioPipeline.ts
      - services/sttClient.ts
      - services/llmClient.ts
      - services/ttsClient.ts
      - utils/logger.ts

=== Requirements ===

1) Implement Twilio Media Streams message handling

Twilio sends JSON messages over WebSocket with this general shape:

- "start" event:
  {
    "event": "start",
    "start": {
      "streamSid": "string",
      "callSid": "string",
      "accountSid": "string"
    }
  }

- "media" event:
  {
    "event": "media",
    "media": {
      "streamSid": "string",
      "payload": "base64-encoded audio frame"
    }
  }

- "stop" event:
  {
    "event": "stop",
    "stop": {
      "streamSid": "string"
    }
  }

Implement robust parsing for these events.

2) Types for Twilio messages

In src/types/messages.ts, define TypeScript types/interfaces for:

- TwilioStreamStartEvent
- TwilioStreamMediaEvent
- TwilioStreamStopEvent
- TwilioStreamEventUnion

and also define a type for internal gateway messages, e.g.:

- GatewaySession
- GatewayOutboundMessage (e.g., audio_out, transcript, etc.)

3) WebSocket server behavior (wsServer.ts):

- Accept incoming WebSocket connections from Twilio’s <Stream url="wss://...">.
- For each connection:
  - On "start" event:
    - Create a new session keyed by streamSid (and callSid if needed).
    - Initialize audio pipeline for that session (audioPipeline.createSession).
  - On "media" event:
    - Decode base64 payload into raw audio bytes.
    - Assume Twilio audio is mono, 8kHz μ-law PCM by default. If needed, leave a clear TODO for transcoding to the format required by the STT service.
    - Pass audio frames to audioPipeline.handleAudioFrame(session, frame).
  - On "stop" event:
    - Close and clean up the session, call audioPipeline.endSession(session).
- Handle JSON parse errors and unknown "event" values gracefully (log warning, ignore).

4) Session management

Create or refine a simple in-memory session manager, for example:

- src/server/sessionManager.ts

Implement:

- getOrCreateSession(streamSid: string, data: { callSid?: string; languageHint?: string; })
- getSession(streamSid: string)
- removeSession(streamSid: string)
- listSessions()

Each session should store:

- streamSid
- callSid
- createdAt
- lastActivityAt
- languageHint (optional)
- any internal STT/LLM/tts state handles if needed.

5) Audio pipeline integration (audioPipeline.ts)

Update audioPipeline.ts so it has:

- createSession(sessionId: string, options?: { languageHint?: string }): Promise<void> | void
- handleAudioFrame(sessionId: string, audioBuffer: Buffer): Promise<void>
- endSession(sessionId: string): Promise<void>

Inside handleAudioFrame:

- Accept raw audio bytes (from Twilio’s base64 payload).
- Include TODO or basic logic to:
  - Feed audio into STT (sttClient) for streaming transcription.
  - Aggregate text into a buffer and periodically send segments to llmClient for responses.
  - Feed LLM reply text into ttsClient to get audio back.

For now you can:
- Implement a simplified pipeline with clear TODOs where the external API calls would go, but keep the function signatures and control flow realistic and compilable.

6) Outbound messages back to Twilio (assistant audio)

Twilio Media Streams can receive audio back if we send JSON messages of type "media" in the other direction, but for this initial version you can:

- Implement a function in wsServer.ts or a helper that can send an "assistant audio" back to Twilio connection when ttsClient produces audio:

  e.g.:

  ws.send(JSON.stringify({
    event: "media",
    media: {
      payload: "<base64-encoded-audio>"
    }
  }));

- Document in comments that audio must be in the correct encoding (e.g., base64 encoded μ-law or PCM with the right sample rate). Use TODO comments where actual transcoding is required.

7) Logging and error handling

- Use utils/logger.ts consistently.
- Log:
  - New connection
  - start/media/stop events with streamSid and callSid
  - Errors with stack traces
- Ensure the gateway does not crash on malformed JSON:
  - Catch JSON.parse errors.
  - Validate that "event" is present and is one of "start", "media", "stop" before acting.

8) Configuration (env.ts)

In src/config/env.ts, ensure there are env vars for:

- GATEWAY_PORT (default 4000)
- LOG_LEVEL (default "info")

Add any Twilio-specific toggles if you want, e.g.:

- TWILIO_EXPECTED_ORIGIN (for basic origin checking, optional).

9) README for gateway

Update or create gateway/README.md with:

- How to run the gateway:
  - npm install
  - npm run dev
- WebSocket URL (e.g., ws://localhost:4000)
- Example Twilio Media Stream JSON messages.
- Explanation of how streamSid/callSid are mapped to internal sessions.
- Short note that audio is Twilio μ-law 8kHz and may need transcoding for different STT providers.

Constraints:

- Use TypeScript everywhere.
- Ensure imports are correct and tsc passes.
- Do NOT change behavior of other services (sttClient, llmClient, ttsClient) beyond what is needed for integration.
- Keep everything compilable and realistic, even if STT/LLM/TTS logic is partially TODO for now.
