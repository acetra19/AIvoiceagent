# Handwerker-AI – Voice Agent Middleware

Middleware/Webhook-Hub between Retell AI and n8n for Berlin plumbing firms.

## Architecture

```
Retell AI (Call ends) → POST /api/v1/retell-webhook → Triage → n8n → Jobber/Calendar
                                                        ↓
                                              Verification Loop (SMS)
```

## Project Structure

```
src/
├── config/          # Env validation (Zod), constants
├── api/
│   ├── routes/      # Express route definitions
│   ├── controllers/ # Request handlers
│   └── middleware/   # Auth, validation, error handling, logging
├── services/        # Business logic (triage, n8n, verification, prompts)
├── models/          # TypeScript interfaces + Zod schemas
├── utils/           # Logger (Winston/GDPR), retry, sanitizer, errors
├── data/            # Berlin zip codes
├── prompts/         # AI persona prompts (Sarah)
├── app.ts           # Express app setup
└── server.ts        # Entry point with graceful shutdown
```

## Quick Start

```bash
cp .env.example .env    # Configure your secrets
npm install
npm run dev             # Development with hot-reload
```

## Docker Deployment (Hetzner VPS)

```bash
docker-compose up -d
```

**n8n on VPS (step-by-step):** see [docs/vps-n8n-setup.md](docs/vps-n8n-setup.md) and copy `deploy/n8n-vps/` to your server.

**Middleware (Retell) on VPS:** `agent.stress-test.net` → [docs/vps-agent-middleware.md](docs/vps-agent-middleware.md), nginx: `deploy/agent-vps/nginx-agent.stress-test.net.conf`, compose: `docker-compose.prod.yml`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/retell-webhook` | `x-retell-auth` header | Retell AI call data |
| GET | `/api/v1/health` | None | Health check |

## Environment Variables

See `.env.example` for all required configuration.

## Key Design Decisions

- **Zod validation** for both env vars and webhook payloads (fail-fast)
- **Layered architecture** (routes → controllers → services) for testability
- **GDPR-compliant logging** with PII sanitization in production
- **Exponential backoff retry** for n8n forwarding
- **Graceful shutdown** for zero-downtime Docker restarts
- **Berlin PLZ as Set** for O(1) lookup performance
