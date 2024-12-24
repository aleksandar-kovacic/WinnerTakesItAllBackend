import dotenv from 'dotenv';
dotenv.config();
import { db } from "./dist/database/arango.js";
import bcrypt from 'bcrypt';

async function bootstrapDB() {
    await db.createCollection("users");
    await db.createCollection("games");
    await db.createEdgeCollection("users2games");

    const insertedGameKey = await addGame();
    const insertedUsersKeys = await addUserToGame();
    await addEdgeUsers2Games(insertedGameKey, insertedUsersKeys);
}

export async function addGame() {
    const cursor = await db.query(/*aql*/`
        LET startDate = DATE_NOW()
        INSERT {
            isActive: true,
            prizePool: 3,
            startDate: startDate,
            endDate: DATE_TIMESTAMP(DATE_ADD(startDate, 7, 'day')),
            winner: null,
            banned: false //TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
        } INTO games
        RETURN NEW._key
    `);
    return cursor.next();
}

export async function addUserToGame() {
    const users = [
        {
            username: "bootstrapUser1",
            email: "bootstrapUser1@mail.com",
            password: process.env.BOOTSTRAPED_USERS_PASSWORD,
            verified: true
        },
        {
            username: "bootstrapUser2",
            email: "bootstrapUser2@mail.com",
            password: process.env.BOOTSTRAPED_USERS_PASSWORD,
            verified: true
        },
        {
            username: "bootstrapUser3",
            email: "bootstrapUser3@mail.com",
            password: process.env.BOOTSTRAPED_USERS_PASSWORD,
            verified: true
        }
    ];

    let insertedUsers = []
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const cursor = await db.query(/*aql*/`
            INSERT {
                username: @username,
                email: @email,
                passwordHashed: @passwordHashed,
                verified: @verified
            } INTO users
            RETURN NEW._key
        `, {
            username: user.username,
            email: user.email,
            passwordHashed: hashedPassword,
            verified: user.verified
        });
        insertedUsers.push(await cursor.next());
    }
    return insertedUsers;
}

export async function addEdgeUsers2Games(insertedGameKey, insertedUsersKeys) {
    for (const userKey of insertedUsersKeys){
        await db.query(/*aql*/`
            INSERT {
                _from: CONCAT('users/', @userKey),
                _to: CONCAT('games/', @insertedGameKey)
            } INTO users2games
            `, {insertedGameKey, userKey});
    }
}

bootstrapDB();
