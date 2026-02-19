import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import BillingClient from './BillingClient';

export default async function BillingPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUsers.length) redirect('/dashboard');

    return <BillingClient user={dbUsers[0]} />;
}
