You are an expert Node.js + TypeScript engineer.

Goal:
Connect the existing /gateway service (Twilio Media Streams bridge) to the NestJS backend AI conversation module.

Scope:
ONLY modify/add code inside /gateway.
Do NOT touch /backend, /frontend, or /infra.

Assumptions:
- Backend exposes (already implemented) endpoints:
  - POST /conversation/start
  - POST /conversation/message
- Gateway already:
  - Handles Twilio WebSocket events: start, media, stop.
  - Has audioPipeline, sttClient, llmClient, ttsClient, sessionManager, logger.

=== Requirements ===

1) Environment configuration

Update src/config/env.ts (or equivalent) to include:

- BACKEND_API_BASE_URL (e.g., http://localhost:3000)
- BACKEND_API_TIMEOUT_MS (optional, default 5000)
- AI_CONVERSATION_ENABLED (optional, default "true")

Export a config object with these values.

2) HTTP client for backend conversation API

Create:

- src/services/backendClient.ts

Implement a class or simple module with:

- async startConversation(params: {
    callerName?: string;
    phoneNumber?: string;
    languageHint?: 'auto' | 'ar' | 'en' | 'ru';
    context?: string;
  }): Promise<{
    conversationId: string;
    initialAssistantMessage: string;
    meta?: any;
  }>

- async sendMessage(params: {
    conversationId: string;
    from: 'caller' | 'assistant';
    text: string;
  }): Promise<{
    reply: string;
    actions?: any[];
    updatedSummary?: string;
  }>

Use Axios or node-fetch with:
- BASE URL from BACKEND_API_BASE_URL env.
- Proper error handling and logging via logger.

3) Extend session state to include conversationId

Update session types and sessionManager so that each session can store:

- streamSid
- callSid
- conversationId (optional string)
- languageHint
- createdAt
- lastActivityAt

Provide getter/setter helpers or extend the session object accordingly.

4) Connect STT output → backend conversation

Assume audioPipeline already handles STT and produces text segments.

Update audioPipeline.ts (and possibly sttClient.ts) so that:

- For each session, when a **caller utterance text** is ready (e.g., finalized transcription):
  - If session has NO conversationId yet:
      - Call backendClient.startConversation:
        - callerName: unknown (or placeholder)
        - phoneNumber: unknown (or placeholder)
        - languageHint: from session.languageHint if any
        - context: include callSid if available
      - Save conversationId into session.
      - Treat backend response.initialAssistantMessage as an AI reply that needs to be spoken:
          - Send this text to ttsClient to synthesize audio.
          - When TTS audio is ready, send it back over the WebSocket (see step 5).
  - If session already has conversationId:
      - Call backendClient.sendMessage with:
        - conversationId
        - from: 'caller'
        - text: <STT text>
      - Take response.reply and send to ttsClient to generate audio reply.
      - Optionally log actions and updatedSummary using logger.

NOTE:
- You do NOT need to implement complex conversation buffering; a simple “utterance → call backend → speak reply” loop is enough.
- Place TODO comments where you would refine utterance segmentation, partial vs final STT, etc.

5) Send TTS audio back to Twilio connection

Wherever ttsClient currently returns audio (or where it should), add logic to:

- Encode audio as base64.
- Send JSON back through the active WebSocket connection with Twilio using:

  {
    "event": "media",
    "media": {
      "payload": "<base64-encoded-audio>"
    }
  }

You can implement a helper like:

- sendAssistantAudio(sessionId: string, audioBuffer: Buffer): void

that locates the appropriate WebSocket connection for the session and sends the JSON string.

Use TODO comments noting that audio must be encoded in the right format for Twilio (e.g., μ-law 8kHz), but keep the control flow and types correct.

6) Wire everything together in wsServer.ts

In wsServer.ts:

- When a "start" event is received:
  - Create or update session with streamSid, callSid, languageHint.
  - Initialize the audio pipeline session if needed.

- When a "media" event is received:
  - Pass audio frame to audioPipeline.handleAudioFrame(sessionId, audioBuffer).

- Ensure audioPipeline has access to:
  - backendClient
  - sessionManager
  - ttsClient
  - logger

Use dependency injection style via constructor parameters or module-level singletons, but keep it consistent and testable.

7) Logging and error handling

- Log when a conversation is started with backend (conversationId).
- Log when messages are sent to backend and replies are received.
- Log any errors from backendClient (timeout, non-2xx status).
- Ensure gateway recovers gracefully if backend is down:
  - Log error.
  - Optionally send a polite fallback audio message once and then ignore further conversation attempts.

8) README update for gateway

Update gateway/README.md with a new section:

- “Backend conversation integration”
  - Explain:
    - BACKEND_API_BASE_URL
    - Flow:
        - Twilio audio → gateway → STT → backend /conversation → TTS → Twilio
    - Mention that if AI_CONVERSATION_ENABLED = "false", gateway may skip backend calls (you can implement this simple check).

Constraints:

- Use TypeScript everywhere.
- Do not break existing Twilio event handling logic.
- Keep the code compilable; stubs or TODOs are allowed for low-level audio format conversions, but all imports and types must be valid.
