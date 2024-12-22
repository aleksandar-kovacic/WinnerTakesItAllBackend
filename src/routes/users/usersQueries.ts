import { db } from "../../database/arango";
import { ArrayCursor } from "arangojs/cursor";

export async function getUserByUsernameQuery(
    username: string
){
    const cursor: ArrayCursor<{_key: string, username: string; email: string, passwordHashed: string}> = await db.query(/*aql*/`
        FOR user in users
        FILTER user.username == @username
        RETURN KEEP(user, '_key', 'username', 'email', 'passwordHashed')
        `, {username});
    
    return cursor.next();
}

export async function createNewUserQuery(
    username: string,
    email: string,
    hashedPassword: string
){
    await db.query(/*aql*/`
        INSERT {
            username: @username,
            email: @email,
            passwordHashed: @hashedPassword,
            verified: false
        } IN users
        `, {username, email, hashedPassword});
}
