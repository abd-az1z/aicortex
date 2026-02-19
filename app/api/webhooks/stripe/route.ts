import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const priceId = subscription.items.data[0]?.price.id;

            let plan: 'starter' | 'growth' | 'enterprise' = 'free' as 'starter';
            if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = 'starter';
            else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) plan = 'growth';

            await db
                .update(users)
                .set({ plan, stripeSubscriptionId: subscription.id })
                .where(eq(users.stripeCustomerId, customerId));
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            await db
                .update(users)
                .set({ plan: 'free', stripeSubscriptionId: null })
                .where(eq(users.stripeCustomerId, customerId));
            break;
        }
    }

    return NextResponse.json({ received: true });
}
