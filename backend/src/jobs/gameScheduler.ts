import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron';
import {
    getWinnerAndActiveGame,
    markActiveGameInactiveBy,
    startNewGameBy,
    GameSchema
} from './gameSchedulerQueries';
import { getEndDateOfGame, getStartDateOfGame } from '../config/scheduleTimeOfGame';

export async function payoutAndStartNewGame() {
    const winnerAndActiveGame = await getWinnerAndActiveGame() as GameSchema;

    // Pay out the prize pool to the winner.
    // If there are no participants in the game,
    // there is no winner and the prize pool is not paid out. 
    if (winnerAndActiveGame.winner) {
        await payOutPrize(winnerAndActiveGame.winner, winnerAndActiveGame.activeGame.prizePool);
    }
    // Mark the current game as inactive
    await markActiveGameInactiveBy(winnerAndActiveGame.activeGame._key);

    // Create a new game
    const now = new Date();
    await startNewGameBy(getStartDateOfGame(now), getEndDateOfGame(now));
}

// TODO: Implement payOutPrize function
export async function payOutPrize(winner: string, prizePool: number): Promise<boolean> {
    // Implement the logic to pay out the prize pool to the winner
    // This could involve updating the user's balance, sending a notification, etc.
    console.log(`Paying out ${prizePool}€ to ${winner}`);
    return true;
}

let payoutAndStartNewGameJobReference: cron.ScheduledTask;

// Schedule the job to run e.g. every Friday at 10PM.
export async function payoutAndStartNewGameJob() {
    payoutAndStartNewGameJobReference = cron.schedule(
        `* * ${process.env.GAME_START_HOUR} * * ${process.env.GAME_START_DAY}`,
        payoutAndStartNewGame, {
        timezone: "Europe/Berlin"
    });
}

export async function stopPayoutAndStartNewGameJob() {
    if (payoutAndStartNewGameJobReference) {
        payoutAndStartNewGameJobReference.stop();
    }
}
