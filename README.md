# AI Receptionist

An AI-powered voice receptionist that answers calls, holds a conversation, acts on what
it is told, and tells a human when something needs one.

The interesting part is that the AI is not just transcribing. The conversation module
runs function-calling against a task layer, so a call can create a record, schedule
something, or trigger a notification while it is still in progress.

## Architecture

NestJS backend, organised by domain rather than by file type:

| Module | Responsibility |
|---|---|
| `telephony` | Inbound webhooks from Twilio / Telnyx, call lifecycle |
| `conversation` | AI client, system prompts, message handling, function calling |
| `tasks` | Actions the model can invoke during a call |
| `calls` | Call records and logging |
| `notifications` | Telegram and email hand-off (`node-telegram-bot-api`, `nodemailer`) |
| `database` | Prisma service over PostgreSQL |

Cross-cutting concerns live in `common/`: a global exception filter and a validation
pipe, with `class-validator` DTOs on every boundary so malformed telephony payloads are
rejected at the edge rather than deep in a service.

## Stack

`NestJS` `TypeScript` `Prisma` `PostgreSQL` `Twilio` `class-validator`

## Running it

Node.js 18+ and a PostgreSQL database are required. Setup, environment variables and
migrations are documented in [`backend/README.md`](backend/README.md).

## Status

Working backend. Not a hosted product, and the telephony provider credentials are
yours to supply.
