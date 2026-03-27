import { db } from "../../database/arango";
import { ArrayCursor } from "arangojs/cursor";

export async function alreadyVerifiedBy(userKey: string) {
    const cursor: ArrayCursor<boolean> = await db.query(/*aql*/`
        LET user = DOCUMENT('users', @userKey)
        FILTER ASSERT(user != NULL, '404_USER_NOT_FOUND')
        RETURN user.verified
    `, { userKey });
    return cursor.next();
}

export async function verifyUserBy(userKey: string) {
    await db.query(/*aql*/`
        LET user = DOCUMENT('users', @userKey)
        FILTER ASSERT(user != NULL, '404_USER_NOT_FOUND')
        UPDATE user WITH { verified: true } IN users
    `, { userKey });
}
