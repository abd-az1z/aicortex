import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUsers.length) redirect('/dashboard');

    return <SettingsClient user={dbUsers[0]} />;
}
