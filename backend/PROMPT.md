You are an expert full-stack architect and DevOps engineer.  
Create a complete production-ready backend for an AI-powered Voice Receptionist system using NestJS + TypeScript.

Only generate the backend/ folder in this step.

Structure requirements:
- NestJS application inside /backend/src
- Modules:
    - calls (handles call logs)
    - telephony (Twilio/Telnyx webhook controllers)
    - tasks (for function-calling results)
    - notifications (Telegram/Email)
    - database (Prisma module)
- Prisma + PostgreSQL schema in /backend/prisma/schema.prisma
- Controllers, services, DTOs, entities for each module
- Global exception filters and validation pipes
- .env.example file

Generate:
- Full folder structure
- Full code for controllers/services/modules
- package.json
- tsconfig.json
- prisma/schema.prisma
- README.md for backend usage
- scripts to run dev server

Write files DIRECTLY into /backend.
Do NOT generate anything for gateway or frontend.
