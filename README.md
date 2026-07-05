# AICortex — AI Cost Intelligence Platform

> **Reduce your LLM bill by 20–40% with one line of code.**

AICortex is an intelligent API gateway that sits between your application and your LLM providers. Instead of blindly sending every request to GPT-4o, it scores each request for complexity and routes it to the cheapest model that can handle it well — while logging every dollar saved in real time. Built as a drop-in OpenAI-compatible replacement: change one URL, start saving.

**Live Demo:** [https://aicortex.dev](https://aicortex.dev) ← _replace with your deployed URL_

---

## The Problem It Solves

AI-native startups are hemorrhaging money. They integrate GPT-4o once because it works, then forget to optimize — paying premium prices for tasks a $0.05/1M token model handles equally well. There's no visibility into what's being spent, on what, or why. AICortex fixes this without any code migration.

**Pilot results across 46 test requests:** 93% routing accuracy, up to **99% cost savings** on simple queries (e.g., $0.000008 actual vs $0.00133 hypothetical).

---

## Features

### Intelligent Complexity Routing
Every request is scored 0–1 using a weighted model that factors in prompt length, task-type keywords, and conversation depth. Simple FAQ? Routes to Groq Llama-8B at $0.05/1M tokens. Complex analysis or code generation? Escalates to GPT-4o or Claude 3.5 Sonnet automatically. Routing preference is user-configurable: `cost`, `balanced`, or `quality`.

### 5-Provider Model Network
A single normalized endpoint across **OpenAI, Anthropic, Google Gemini, Groq, and Mistral** — 11 models, 3 tiers. All provider differences are abstracted behind a unified `generateCompletion()` interface.

| Tier | Models | Cost Range |
|------|--------|-----------|
| Cheap | Groq Llama 3.1 8B, Gemini 1.5 Flash, Claude 3 Haiku | $0.05–$0.30/1M |
| Mid | GPT-4o Mini, Llama 3.1 70B, Mistral Large | $0.15–$2.00/1M |
| Premium | GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro | $3.00–$15.00/1M |

### Automatic Fallback & Retry
If a model fails, rate-limits, or times out — the system automatically retries and escalates to the next tier. No downtime, no manual intervention, no alert fatigue. Auth errors short-circuit immediately to avoid wasted retries.

### Per-Request Cost Accounting
Every response includes an `aicortex` metadata block with:
- `cost_actual_usd` — what you actually paid
- `cost_hypothetical_usd` — what GPT-4o would have cost
- `savings_usd` + `savings_percent` — your realized savings
- `difficulty_score` + `scoring_factors` — full routing transparency

### Budget Guardrails
Set a monthly spend cap. Requests that would exceed it are rejected before the model call fires. Starter plan includes a 500K request/month limit with upgrade path to Growth (unlimited).

### Cost Intelligence Dashboard
A real-time analytics UI showing:
- Total spend vs hypothetical spend (area chart)
- Savings generated this month
- Spend breakdown by model (pie chart)
- Request volume, avg latency, and error rate
- Monthly rollups stored as materialized summaries

### Drop-In OpenAI Compatibility
The API is fully OpenAI-compatible — same request/response schema, same `Authorization: Bearer` header format, same `choices[0].message.content` response path. Existing SDKs work without modification.

```bash
# Before
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}'

# After — same format, intelligent routing
curl https://api.aicortex.dev/api/v1/chat/completions \
  -H "Authorization: Bearer aicx_your_key" \
  -d '{"model": "auto", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM |
| Billing | Stripe (Checkout + webhooks) |
| UI | Tailwind CSS + Radix UI primitives |
| Charts | Recharts |
| Validation | Zod |
| LLM SDKs | OpenAI, Anthropic, Google Generative AI, Groq, Mistral |

---

## Architecture

```
User Request
     │
     ▼
Complexity Scoring Engine   ←─ prompt length + keyword signals + context turns
     │
     ▼
Cost-Aware Routing Layer    ←─ cheap / mid / premium + user preference
     │
     ▼
Fallback Handler            ←─ retry → escalate → next provider
     │
     ├── Success ──► Cost Calculator ──► DB Logging ──► OpenAI-compatible Response
     │                                                    + aicortex metadata block
     └── All failed ──► 503
```

See [architecture_flow.md](architecture_flow.md) for the full Mermaid diagram.

---

## Running Locally

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application
- At least one LLM provider API key (OpenAI, Anthropic, Groq, Gemini, or Mistral)
- (Optional) Stripe account for billing

### 1. Clone & install

```bash
git clone https://github.com/your-username/aicortex.git
cd aicortex
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# LLM Providers (add whichever you have)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AIza..."
GROQ_API_KEY="gsk_..."
MISTRAL_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AICORTEX_INTERNAL_SECRET="any-random-string"
```

### 3. Set up the database

```bash
npm run db:push       # pushes schema to Neon
npm run db:studio     # optional: open Drizzle Studio to inspect tables
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, grab your API key from the dashboard, and make your first request:

```bash
curl http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer aicx_your_key_here" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
  }'
```

Check the `aicortex` field in the response to see the routing decision and savings.

---

## Pricing

| Plan | Price | Requests | Features |
|------|-------|----------|---------|
| Starter | $299/mo | 500K/month | Basic routing, 5 providers, analytics |
| Growth | $999/mo | Unlimited | Advanced routing, budget guardrails, priority support |
| Enterprise | Custom | Unlimited | Dedicated cluster, SLA routing, on-prem option |

Priced on value delivered — not per token.

---

## Project Background

Built in 4 weeks as an end-to-end product: from PRD and ICP definition through to a working API gateway, billing integration, and analytics dashboard. The core thesis: AI-native startups are flying blind on LLM spend, and a cost-aware routing layer can save them 20–40% with zero migration effort.

**Key engineering decisions:**
- OpenAI-compatible schema so adoption requires zero SDK changes
- Fallback handler escalates tiers rather than failing — prioritizes uptime over cost purity
- Fire-and-forget DB logging keeps API latency unaffected by analytics writes
- Complexity scorer weights keywords at 45% (dominant signal) vs length at 40% and context at 15%

---

## Roadmap

- [ ] Streaming support (`stream: true`)
- [ ] Prompt compression (reduce input tokens before routing)
- [ ] Quality evaluation harness (automatic A/B benchmarking per workflow)
- [ ] SLA-aware routing (latency budget as a first-class routing signal)
- [ ] Cost-performance score per workflow
- [ ] SOC2 compliance pathway

---

## Author

**Abdulaziz** — [mohdabdulaziz2023@gmail.com](mailto:mohdabdulaziz2023@gmail.com)

Built to prove that LLM cost optimization is an infrastructure problem, not a product management problem. If you're spending serious money on LLMs and want to talk, reach out.
