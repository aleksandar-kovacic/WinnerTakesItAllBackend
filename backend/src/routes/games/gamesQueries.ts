import { ArrayCursor } from "arangojs/cursor";
import { db } from "../../database/arango";

type GameInformation = {
    prizePool: number,
    endDate: number
}

export async function getGameInformation() {
    const cursor: ArrayCursor<GameInformation> = await db.query(/*aql*/`
            FOR game IN games
                FILTER game.isActive == true
                RETURN KEEP(game, 'prizePool', 'endDate')
    `);
    return cursor.next();
}
