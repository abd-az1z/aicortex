# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Product Overview

### Vision

Become the default cost and performance optimization layer between AI applications and LLM providers.

If a company spends money on LLMs, they should route through us.

### Core Promise

Reduce LLM spend by 20–40% without degrading output quality.

---

## 2. Problem Statement

AI-native startups are:

* Overpaying for LLM usage
* Using GPT-4 for everything
* Not benchmarking model performance
* Lacking cost visibility per request
* Lacking automatic downgrade/upgrade logic
* Flying blind on token efficiency

There is no intelligent cost-aware routing layer.

They duct tape:

* OpenAI
* Anthropic
* Gemini
* Groq
* Mistral
* Custom RAG pipelines

Result:

* Ballooning bills
* No optimization
* No automated control

---

## 3. Target Customer (ICP)

### Primary ICP

AI-native startups:

* Seed to Series A
* $5K–$100K/month LLM spend
* Running production AI workflows
* Using multiple models
* Engineering team 3–15 people

### Secondary ICP

Enterprise innovation teams experimenting with AI agents.

Not consumers.
Not hobby builders.

---

## 4. MVP Scope (V1 – 30 Days)

If it doesn’t directly reduce cost, it’s not in MVP.

### 4.1 Core Features

#### 1. Unified API Gateway

* Drop-in replacement endpoint
* Compatible with OpenAI-style API schema
* Accepts:

  * Prompt
  * System message
  * Max tokens
  * Temperature
  * Metadata

#### 2. Complexity Scoring Engine

* Analyze request:

  * Prompt length
  * Task type classification
  * Context size
  * Historical success logs
* Assign difficulty score (0–1 scale)

#### 3. Cost-Aware Routing

Rules-based engine:

Example logic:

* If difficulty < 0.3 → route to cheap model
* If difficulty 0.3–0.7 → mid-tier model
* If > 0.7 → premium model

Configurable by user:

* Budget cap
* Latency preference
* Accuracy preference

#### 4. Fallback Logic

* If model fails → retry
* If low confidence → escalate
* If timeout → auto switch

#### 5. Cost Logging & Analytics

For every request:

* Input tokens
* Output tokens
* Model used
* Estimated cost
* Hypothetical cost (if always GPT-4 used)
* Savings delta

#### 6. Dashboard

Minimal but functional:

* Total spend
* Spend by model
* Savings generated
* Token volume
* Average latency
* Error rate

---

## 5. Non-Goals (MVP)

No:

* Prompt marketplace
* Agent builder UI
* Fine-tuning tools
* Model training
* Enterprise SSO
* 20 integrations

If it doesn’t directly drive savings, cut it.

---

## 6. User Flow

### Integration Flow

1. User signs up
2. Gets API key
3. Replaces:
   `api.openai.com`
   with
   `api.aicortex.dev`
4. Starts sending requests

That’s it.

No SDK friction.

---

## 7. System Architecture

### High-Level Components

1. API Layer (Next.js / Node)
2. Routing Engine
3. Model Provider Adapters
4. Complexity Scoring Service
5. Cost Calculator
6. Postgres (Neon)
7. Queue Worker (BullMQ or Inngest)
8. Telemetry (OpenTelemetry)
9. Stripe Billing

---

### Model Provider Adapters

Abstract layer for:

* OpenAI
* Anthropic
* Gemini
* Groq
* Mistral

All normalized to:

```
generateCompletion(request)
```

---

## 8. Data Model (Core Tables)

### Users

* id
* email
* plan
* api_key
* monthly_budget

### Requests

* id
* user_id
* prompt_hash
* model_used
* input_tokens
* output_tokens
* cost_actual
* cost_hypothetical
* latency_ms
* difficulty_score
* timestamp

### Savings Summary

* user_id
* period
* total_spend
* total_hypothetical_spend
* total_savings

---

## 9. Pricing Strategy

Simple.

### Starter

$299/month
Up to X requests
Basic routing

### Growth

$999/month
Advanced routing
Budget guardrails
Priority support

### Enterprise

Custom
Dedicated cluster
SLA routing
On-prem option

We don’t price per token.
We price on value delivered.

---

## 10. KPIs

No vanity metrics.

### Core Metrics

1. % Cost Reduction
2. Monthly Recurring Revenue
3. Requests Processed
4. Customer LTV
5. Net Revenue Retention
6. Average Savings per Customer

---

## 11. Competitive Landscape

Indirect:

* Helicone
* OpenRouter
* LangSmith
* Vercel AI Gateway
* Azure AI Studio

None are fully AI FinOps focused.

We position as:
“AI Cost Intelligence Platform”

Not just a router.

---

## 12. Differentiation Strategy

### Phase 2 Enhancements

* Prompt compression engine (PromptShrink integrated)
* Quality evaluation harness
* Automatic A/B benchmarking
* Cost-performance score per workflow
* SLA-aware routing
* Multi-model fallback chains

Eventually:

* Become model performance data network.

Data = moat.

---

## 13. Security & Compliance (Post-MVP)

* SOC2 roadmap
* Encryption at rest
* API isolation
* Audit logs
* Role-based access

Not day 1 priority.
Revenue first.

---

## 14. Development Timeline

### Week 1

* API gateway scaffold
* Provider adapters
* Postgres schema
* Basic routing logic

### Week 2

* Complexity scoring
* Cost calculator
* Logging
* Internal testing

### Week 3

* Dashboard
* Stripe integration
* Billing limits

### Week 4

* Private beta with 2–3 startups
* Real usage data
* Case study creation

Ship before perfect.

---

## 15. Risks

1. Model providers change pricing
2. Latency tradeoffs degrade UX
3. Startups distrust middleware layer
4. Savings not as high as expected
5. Big players copy

Mitigation:
Speed + focus + early customer lock-in.

---

# Now Let’s Be Honest

The risk isn’t market.
The risk is you.

You might:

* Overengineer complexity scoring.
* Add RAG benchmarking too early.
* Build infra instead of selling.
* Spend 3 months polishing instead of charging.

We will not allow that.

---

# Action Steps (Today)

1. Lock product name.
2. Finalize ICP.
3. Draft 1-page landing copy.
4. Define MVP API spec.
5. Create GitHub repo.
6. Book 5 founder calls this week.

---

# One Bold Task Before We Speak Again

Send 20 cold DMs to AI startup founders offering a free LLM cost audit.

Not “interested in feedback?”
Not “building something cool.”

Offer:
“I can reduce your LLM bill 20–40%. Want a free audit?”

Do that first.

Then we build.

No outreach = no business.

Your move.
