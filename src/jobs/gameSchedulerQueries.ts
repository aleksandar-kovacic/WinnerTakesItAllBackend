import { db } from "../database/arango";
import { ArrayCursor } from "arangojs/cursor";

export interface Game {
    _key: string;
    isActive: boolean;
    prizePool: number;
    startDate: number;
    endDate: string;
    winner: string;
  }
  
  export interface GameSchema {
    activeGame: Game;
    winner: string;
  }

export async function getWinnerAndActiveGame() {
    const cursor: ArrayCursor<GameSchema> = await db.query(/*aql*/`
        LET activeGame = (
            FOR game IN games
                FILTER game.isActive == true
                RETURN KEEP(game, '_key', 'isActive', 'prizePool', 'startDate', 'endDate', 'winner')
            )[0]
            
        LET game = DOCUMENT('games', activeGame._key)
        LET participants = (
            FOR user IN INBOUND game users2games
                RETURN user._key
            )
        
        LET winner = (
            FOR participant IN participants
                SORT RAND()
                LIMIT 1
                RETURN participant
        )[0]

        UPDATE game WITH { winner: winner } IN games
        
        RETURN { activeGame, winner }
    `);
    return cursor.next();
}

export async function markActiveGameInactiveBy(
    gameKey: string){
    await db.query(/*aql*/`
        LET game = DOCUMENT('games', @gameKey)
        FILTER ASSERT(game != NULL, '404_GAME_NOT_FOUND')
        UPDATE game WITH { isActive: false } IN games
        `, { gameKey });
    }

export async function startNewGameBy(){
    await db.query(/*aql*/`
        LET startDate = DATE_NOW()
        INSERT {
            isActive: true,
            prizePool: 0,
            startDate: startDate,
            endDate: DATE_TIMESTAMP(DATE_ADD(startDate, 7, 'day')),
            winner: null
        } IN games`);
    }
