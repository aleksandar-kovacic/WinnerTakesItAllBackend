import { db } from "../../database/arango";
import { ArrayCursor } from "arangojs/cursor";

export async function createSatelliteData(
    userKey: string,
    satelliteName: string
){
    await db.query(/*aql*/`
        LET user = DOCUMENT('users', @userKey)
        FILTER ASSERT(user != NULL, 'User not found')
        INSERT {
            satelliteName: @satelliteName
        } IN satellites
        INSERT {
            _from: user._id,
            _to: NEW._id
        } IN users2satellites
        `, {userKey, satelliteName});
}

export async function getSatelliteDataByUser(
    userKey: string
){
    const cursor: ArrayCursor<{ satelliteName: string; }> = await db.query(/*aql*/`
        LET user = DOCUMENT('users', @userKey)
        FOR satellite IN OUTBOUND user users2satellites
            RETURN KEEP(satellite, 'satelliteName')
        `, {userKey});
    
    return cursor.all();
}
