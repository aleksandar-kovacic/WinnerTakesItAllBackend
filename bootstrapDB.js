import dotenv from 'dotenv';
dotenv.config();
import { db } from "./dist/database/arango.js";
import bcrypt from 'bcrypt';

// This function calculates the start date of the game. Based on the current date, it calculates the last scheduled day of the game.
export const getStartDateOfGame = (dateNow) => {
    const dayOfWeek = parseInt(String(process.env.GAME_START_DAY));
    const hourOfDay = parseInt(String(process.env.GAME_START_HOUR));
    const lastScheduledDay = new Date(dateNow);
    lastScheduledDay.setDate(dateNow.getDate() - (dateNow.getDay() + 7 - dayOfWeek) % 7);
    lastScheduledDay.setHours(hourOfDay, 0, 0, 0);
    return lastScheduledDay.getTime();
};

// This function calculates the end date of the game. Based on the current date, it calculates the next scheduled day of the game.
export const getEndDateOfGame = (dateNow) => {
    const dayOfWeek = parseInt(String(process.env.GAME_START_DAY));
    const hourOfDay = parseInt(String(process.env.GAME_START_HOUR));
    const nextScheduledDay = new Date(dateNow);
    nextScheduledDay.setDate(dateNow.getDate() + (dayOfWeek - dateNow.getDay() + 7) % 7);
    nextScheduledDay.setHours(hourOfDay, 0, 0, 0);
    return nextScheduledDay.getTime();
};

async function bootstrapDB() {
    await db.createCollection("users");
    await db.createCollection("games");
    await db.createEdgeCollection("users2games");

    const now = new Date();
    const insertedGameKey = await addGame(getStartDateOfGame(now), getEndDateOfGame(now));
    const insertedUsersKeys = await addUserToGame();
    await addEdgeUsers2Games(insertedGameKey, insertedUsersKeys);
}

export async function addGame(startDateOfGame, endDateOfGame) {
    const cursor = await db.query(/*aql*/`
        INSERT {
            isActive: true,
            prizePool: 3,
            startDate: @startDateOfGame,
            endDate: @endDateOfGame,
            dateCreated: DATE_NOW(),
            winner: null,
            banned: false //TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
        } INTO games
        RETURN NEW._key
    `, {startDateOfGame, endDateOfGame});
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
