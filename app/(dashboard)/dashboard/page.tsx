import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDashboardStats, getSpendOverTime } from '@/lib/analytics';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    // Get or create DB user
    let dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

    if (!dbUsers.length) {
        // First visit — create user directly (server-side fetch can't forward Clerk session cookies)
        const clerkUser = await currentUser();
        if (!clerkUser) redirect('/sign-in');

        const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
        const apiKey = `aicx_${nanoid(32)}`;
        dbUsers = await db.insert(users).values({
            clerkId: userId,
            email,
            apiKey,
            plan: 'free',
        }).returning();
    }

    const user = dbUsers[0];
    const stats = await getDashboardStats(user.id);
    const spendHistory = await getSpendOverTime(user.id);

    return <DashboardClient user={user} stats={stats} spendHistory={spendHistory} />;
}
