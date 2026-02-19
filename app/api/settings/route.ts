import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { monthlyBudget, routingPreference } = body;

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUsers.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await db.update(users).set({
        monthlyBudget: monthlyBudget ?? null,
        routingPreference: routingPreference ?? 'balanced',
        updatedAt: new Date(),
    }).where(eq(users.clerkId, userId));

    return NextResponse.json({ success: true });
}
