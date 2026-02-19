import { pgTable, text, integer, real, timestamp, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// ENUMS
// ============================================================
export const planEnum = pgEnum('plan', ['free', 'starter', 'growth', 'enterprise']);
export const modelTierEnum = pgEnum('model_tier', ['cheap', 'mid', 'premium']);
export const requestStatusEnum = pgEnum('request_status', ['success', 'failed', 'fallback', 'timeout']);

// ============================================================
// USERS
// ============================================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull().unique(),
    plan: planEnum('plan').notNull().default('free'),
    apiKey: text('api_key').notNull().unique(),
    monthlyBudget: real('monthly_budget'), // USD, null = unlimited
    routingPreference: text('routing_preference').notNull().default('balanced'), // 'cost' | 'balanced' | 'quality'
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// REQUESTS
// ============================================================
export const requests = pgTable('requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    promptHash: text('prompt_hash').notNull(), // SHA-256 of prompt for dedup analysis
    modelUsed: text('model_used').notNull(),
    modelTier: modelTierEnum('model_tier').notNull(),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    costActual: real('cost_actual').notNull(), // USD
    costHypothetical: real('cost_hypothetical').notNull(), // if GPT-4o was used
    savingsDelta: real('savings_delta').notNull(), // costHypothetical - costActual
    latencyMs: integer('latency_ms').notNull(),
    difficultyScore: real('difficulty_score').notNull(), // 0-1
    status: requestStatusEnum('status').notNull().default('success'),
    fallbackUsed: boolean('fallback_used').notNull().default(false),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================
// SAVINGS SUMMARY (materialized monthly rollups)
// ============================================================
export const savingsSummary = pgTable('savings_summary', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    period: text('period').notNull(), // 'YYYY-MM'
    totalSpend: real('total_spend').notNull().default(0),
    totalHypotheticalSpend: real('total_hypothetical_spend').notNull().default(0),
    totalSavings: real('total_savings').notNull().default(0),
    requestCount: integer('request_count').notNull().default(0),
    totalInputTokens: integer('total_input_tokens').notNull().default(0),
    totalOutputTokens: integer('total_output_tokens').notNull().default(0),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
    requests: many(requests),
    savingsSummary: many(savingsSummary),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
    user: one(users, { fields: [requests.userId], references: [users.id] }),
}));

export const savingsSummaryRelations = relations(savingsSummary, ({ one }) => ({
    user: one(users, { fields: [savingsSummary.userId], references: [users.id] }),
}));

// ============================================================
// TYPES
// ============================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
export type SavingsSummary = typeof savingsSummary.$inferSelect;
