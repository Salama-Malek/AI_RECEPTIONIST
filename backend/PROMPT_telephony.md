You are an expert NestJS + TypeScript backend and telephony engineer.

Goal:
Add Twilio (telephony) integration to the existing NestJS backend for the AI Receptionist system.

Scope:
ONLY modify/add code inside /backend. 
Do NOT touch /gateway, /frontend, or /infra.

Monorepo layout:
- /backend  (NestJS + Prisma + AI conversation module already exists)
- /gateway  (WebSocket realtime audio STT→LLM→TTS)
- /frontend (React + dashboard)
- /infra    (Docker)

=== Requirements ===

1) Create a new NestJS TelephonyModule

Files to add/modify:

- src/telephony/telephony.module.ts
- src/telephony/telephony.controller.ts
- src/telephony/telephony.service.ts
- src/telephony/dto/incoming-call.dto.ts     (for optional parsing of Twilio params)
- src/telephony/dto/status-callback.dto.ts   (for call status updates)
- src/telephony/types/telephony.types.ts
- src/config/telephony.config.ts             (for env-based config if you use a config pattern)

Register TelephonyModule in AppModule.

2) Env variables

Update backend .env.example (or create it if missing) with:

- TWILIO_ACCOUNT_SID=
- TWILIO_AUTH_TOKEN=
- TWILIO_VOICE_WEBHOOK_URL=        # This backend endpoint, e.g. https://your-domain.com/telephony/incoming
- TWILIO_STATUS_CALLBACK_URL=      # This backend endpoint, e.g. https://your-domain.com/telephony/status
- GATEWAY_WS_URL=                  # WebSocket URL of the gateway, e.g. wss://gateway.your-domain.com/stream
- APP_PUBLIC_BASE_URL=             # Base URL of this backend (used when generating URLs in responses)

Only read these variables; do not hard-code secrets.

3) Incoming call webhook (TwiML)

Create an endpoint:

- POST /telephony/incoming

Responsibilities:

- Receive Twilio’s incoming voice webhook (standard Voice URL).
- Log or parse the basic params (From, To, CallSid, etc.).
- Return valid TwiML **as XML** that:
  - Greets the caller (simple <Say> is fine).
  - Starts a media stream to the gateway using Twilio <Connect><Stream>.

Example structure:

<Response>
  <Say>Connecting you to Salama's AI assistant. Please hold.</Say>
  <Connect>
    <Stream url="wss://your-gateway-url/stream">
      <!-- Optionally pass CallSid or custom parameters -->
      <Parameter name="callId" value="some-id" />
    </Stream>
  </Connect>
</Response>

Implementation details:

- Use GATEWAY_WS_URL env variable for the <Stream url="...">.
- Optionally generate a server-side callId and include it as a <Parameter>.
- Ensure response has content-type "text/xml".

4) Call status callback

Create endpoint:

- POST /telephony/status

Responsibilities:

- Receive Twilio call status callbacks (CallStatus, CallSid, Duration, etc.).
- Log/store the status update in the database (if Prisma models exist), or at least log properly for now.
- Return 200 OK with a small JSON body or empty.

5) Security (basic)

- Add helper in TelephonyService to verify Twilio requests using X-Twilio-Signature header and TWILIO_AUTH_TOKEN.
- For now, implement a method like:
    - validateTwilioSignature(req: Request): boolean
- Apply this check in telephony.controller:
    - If invalid, return 403 Forbidden.
- Write the signature verification in a way that can be replaced by Twilio’s official helper later if needed.

6) Types and DTOs

- incoming-call.dto.ts:
    - fields for common Twilio Voice webhook params (From, To, CallSid, CallStatus, etc.).
    - use class-validator decorators for optional/required ones.

- status-callback.dto.ts:
    - fields for commonly used status callback params (CallSid, CallStatus, Duration, etc.).

7) Integration notes with gateway

- TelephonyService should not directly call the gateway WebSocket.
- The TwiML must instruct Twilio to open a media stream to GATEWAY_WS_URL.
- In telephony.types.ts, define a simple type for how we represent a telephony call in the backend (callId, from, to, twilioCallSid, status).

8) README backend update

- Update backend/README.md to document:
    - New endpoints:
        - POST /telephony/incoming  (Twilio Voice webhook)
        - POST /telephony/status   (Twilio status callbacks)
    - Example curl for testing:
        - Explain that Twilio will POST form-encoded data.
    - Example TwiML returned.

Constraints:

- Use NestJS best practices (Controllers, Services, Modules).
- Use TypeScript everywhere.
- Ensure imports are correct and project compiles.
- Do NOT generate any Twilio account credentials; just use env variables.
- Do NOT modify unrelated features except to register TelephonyModule in the root AppModule.
