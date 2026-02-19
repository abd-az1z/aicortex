import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST /api/auth/sync — called after Clerk sign-up to create DB user
export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (existing.length > 0) {
        return NextResponse.json({ user: existing[0] });
    }

    // Create new user with generated API key
    const apiKey = `aicx_${nanoid(32)}`;
    const [newUser] = await db.insert(users).values({
        clerkId: userId,
        email,
        apiKey,
        plan: 'free',
    }).returning();

    return NextResponse.json({ user: newUser });
}

// GET /api/auth/me — get current user data
export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!result.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: result[0] });
}
