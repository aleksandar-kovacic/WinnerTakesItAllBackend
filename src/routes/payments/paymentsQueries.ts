import { db } from "../../database/arango";
import { ArrayCursor } from "arangojs/cursor";

export async function addUserToGame(userKey: string, amount: number) {
    await db.query(/*aql*/`
        LET activeGame = (
            FOR game IN games
                FILTER game.isActive == true
                RETURN game
            )[0]
        
        FILTER ASSERT(activeGame._id != NULL, '404_GAME_NOT_FOUND')
        
        INSERT {
            _from: CONCAT('users/', @userKey),
            _to: activeGame._id
        } IN users2games

        UPDATE activeGame WITH { prizePool: activeGame.prizePool + @amount } IN games
    `, { userKey, amount });
}

export async function alreadyPayed(userKey: string) {
    const cursor: ArrayCursor<boolean> = await db.query(/*aql*/`
        LET user = DOCUMENT('users', @userKey)
        LET game = (FOR game IN OUTBOUND user users2games
            FILTER game.isActive == true
            RETURN game)
        RETURN LENGTH(game) > 0 ? true : false
    `, { userKey });
    return cursor.next();
}
