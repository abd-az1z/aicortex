
import { db, users } from './lib/db';

async function getUsers() {
    try {
        const allUsers = await db.select().from(users).limit(5);
        console.log(JSON.stringify(allUsers, null, 2));
    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

getUsers();
