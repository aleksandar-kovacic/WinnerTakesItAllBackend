import { db } from "../../database/arango";
import { ArrayCursor } from "arangojs/cursor";

//TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
export async function isBannedBy(userKey: string) {
    const cursor: ArrayCursor<boolean> = await db.query(/*aql*/`
        LET user = DOCUMENT(users, @userKey)
        FILTER ASSERT(user != NULL, '404_USER_NOT_FOUND')
        RETURN user.banned
    `, { userKey });
    return cursor.next();
}

//TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
export async function banUserBy(userKey: string){
    await db.query(/*aql*/`
        LET user = DOCUMENT(users, @userKey)
        FILTER ASSERT(user != NULL, '404_USER_NOT_FOUND')
        UPDATE user WITH { banned: true } IN users
    `, { userKey});
}

//TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
export async function unbanUserBy(userKey: string){
    await db.query(/*aql*/`
        LET user = DOCUMENT(users, @userKey)
        FILTER ASSERT(user != NULL, '404_USER_NOT_FOUND')
        UPDATE user WITH { banned: false } IN users
    `, { userKey});
}
