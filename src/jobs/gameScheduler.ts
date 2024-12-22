import cron from 'node-cron';
import { 
    getWinnerAndActiveGame,
    markActiveGameInactiveBy,
    startNewGameBy,
    GameSchema } from './gameSchedulerQueries';

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
    await startNewGameBy();
}

// TODO: Implement payOutPrize function
export async function payOutPrize(winner: string, prizePool: number): Promise<boolean> {
    // Implement the logic to pay out the prize pool to the winner
    // This could involve updating the user's balance, sending a notification, etc.
    console.log(`Paying out ${prizePool}€ to ${winner}`);
    return true;
}

// Schedule the job to run every Friday 10pm
export const cronJob = cron.schedule('0 22 * * 5', payoutAndStartNewGame, {
    timezone: "Europe/Berlin"
});

cronJob.start();
