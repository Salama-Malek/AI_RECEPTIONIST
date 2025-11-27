You are an expert NestJS + TypeScript architect and AI engineer.

Goal:
Add an AI “conversation brain” for the Salama AI Receptionist inside the existing NestJS backend.

Scope:
ONLY modify/add code inside /backend. 
Do NOT touch /gateway or /frontend.

Existing monorepo layout:
- /backend  (NestJS + Prisma + PostgreSQL)
- /gateway  (WebSocket realtime audio)
- /frontend (React + Vite)
- /infra    (Docker + compose)

=== Requirements ===

1) Create a new NestJS module: ConversationModule

Files to create inside /backend/src:

- src/conversation/conversation.module.ts
- src/conversation/conversation.controller.ts
- src/conversation/conversation.service.ts
- src/conversation/dto/start-conversation.dto.ts
- src/conversation/dto/message.dto.ts
- src/conversation/types/conversation.types.ts
- src/conversation/prompts/system-prompt.ts

2) ConversationController:

Base route: /conversation

Endpoints:
- POST /conversation/start
  - Body: StartConversationDto
    - callerName: string
    - phoneNumber: string
    - languageHint?: 'auto' | 'ar' | 'en' | 'ru'
    - context?: string  (optional notes for Salama)
  - Returns:
    - conversationId: string
    - initialAssistantMessage: string
    - meta: object (e.g., languageDetected, timestamp)

- POST /conversation/message
  - Body: MessageDto
    - conversationId: string
    - from: 'caller' | 'assistant'
    - text: string
  - Behavior:
    - Append message to conversation history (in memory or DB as you see fit).
    - Call ConversationService to get the next AI reply.
  - Returns:
    - reply: string
    - actions?: ConversationAction[] (e.g., create_task, send_notification)
    - updatedSummary: string

3) ConversationService responsibilities:

- Maintain conversation state (can be in memory for now, but create types so it is easy to move to DB later).
- Call an AI provider (e.g., OpenAI) using a dedicated AI client.
- Use a strong system prompt to act as “Salama’s AI Receptionist”.

Create a separate AI client service:

- src/conversation/ai/ai-client.service.ts
- src/conversation/ai/ai.types.ts

The AI client must:
- Accept: conversation history of messages (role: system/user/assistant), caller metadata, languageHint.
- Return: 
  - assistant reply text
  - optional structured actions (e.g., create_task, send_notification, mark_spam, mark_urgent).

Use environment variables (add them to backend/.env.example if it exists):
- OPENAI_API_KEY
- OPENAI_MODEL (e.g., gpt-4.1 or similar string)
- AI_RECEPTIONIST_NAME (default: "Salama AI Receptionist")

4) System prompt content:

Implement src/conversation/prompts/system-prompt.ts that exports a function:

- getReceptionistSystemPrompt(options?: { languageHint?: 'auto' | 'ar' | 'en' | 'ru' }): string

The system prompt must define behavior:

- Identity:
  - “You are Salama’s AI Receptionist. You answer incoming calls on his behalf.”
- Language:
  - Automatically detect Arabic vs English vs Russian from caller text, but follow languageHint if provided.
  - Always reply in the caller’s language unless explicitly instructed otherwise.
- Behavior:
  - Always introduce yourself briefly at the start of a conversation.
  - Ask for caller name and reason for the call.
  - Ask about urgency (today / this week / flexible).
  - Distinguish:
      - personal vs business
      - normal vs urgent vs spam/sales
  - For spam/sales:
      - Politely decline and mark as spam.
  - For emergencies:
      - Ask clarifying questions.
      - Trigger an "urgent" action: send_notification({ type: 'urgent', message: '...' }).
  - For normal calls:
      - Collect structured info:
          - Caller name
          - Phone number
          - Topic
          - Preferred callback time
  - Keep responses short and polite (1–3 sentences per turn).
- Output:
  - Besides natural language reply, instruct model to also produce a small JSON “action summary” with:
      - "intent": e.g., "info_request" | "schedule_callback" | "spam" | "emergency"
      - "urgency": "low" | "medium" | "high"
      - "notes": short text.

5) Conversation types:

Define TypeScript types in src/conversation/types/conversation.types.ts:
- ConversationMessage (id, role, text, timestamp)
- ConversationIntent ('info_request' | 'schedule_callback' | 'spam' | 'emergency' | 'other')
- ConversationUrgency ('low' | 'medium' | 'high')
- ConversationAction:
    - type: 'create_task' | 'send_notification' | 'mark_spam' | 'none'
    - payload: any

6) Integration with backend modules (lightweight):

- ConversationService should be able to:
    - Optionally call existing Task or Notification services via dependency injection if they exist.
    - If they don’t exist yet, create simple placeholder services or TODO comments with clear interfaces so they can be wired later.

7) Validation and error handling:

- Use class-validator decorators on DTOs.
- Use NestJS standard exception handling patterns.
- Return proper HTTP status codes (400 for invalid input, 500 for internal errors).

8) README update:

- Update backend/README.md to document:
    - New /conversation/start and /conversation/message endpoints.
    - Example request and response JSON for both.
    - Note that gateway or frontend can call these endpoints for debugging text-only conversations.

Constraints:
- Use TypeScript everywhere.
- Ensure imports are correct and NestJS compiles.
- Do not modify unrelated modules except to register ConversationModule in AppModule.
