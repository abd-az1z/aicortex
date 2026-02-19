import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getRecentRequests } from '@/lib/analytics';
import RequestsClient from './RequestsClient';

export default async function RequestsPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUsers.length) redirect('/dashboard');

    const recentRequests = await getRecentRequests(dbUsers[0].id, 100);

    return <RequestsClient requests={recentRequests} />;
}
