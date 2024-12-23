import request from 'supertest';
import app from '../../app';
import { payoutAndStartNewGame } from '../gameScheduler';
import { db } from "../../database/arango";
import { ArrayCursor } from "arangojs/cursor";
import { Game } from '../gameSchedulerQueries';
import { getUserKeyFromSession } from '../../database/redis';
import fs from 'fs';
import path from 'path';

const date = Date.now();

describe('Create three users, let them participate in the game and then get the winner of them', () => {
  it('Create three users, let them play, get the winner', async () => {
    
    // Close the current game and start a new one
    await payoutAndStartNewGame();
    
    // Create three users and let them participate in the game
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const username = `testUser-${date}-${i}`;

      await request(app)
        .post('/users/register')
        .send({
          username,
          email: `testUser${i}@example.com`,
          password: 'Passw0rd!',
        });
      const response = await request(app)
        .post('/users/login')
        .send({
          username,
          password: 'Passw0rd!',
        });

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0].length).toBeGreaterThan(1);

      //Convert jpg to base64
      const idFrontImage = fs.readFileSync(path.resolve(__dirname, '../../../test_utils/idFrontImageExample.jpg')).toString('base64');
      const personImage = fs.readFileSync(path.resolve(__dirname, '../../../test_utils/personImageExample.jpg')).toString('base64');

      //Verify the user
      const verification = await request(app)
        .post('/verification/verify')
        .send({ idFrontImage: idFrontImage, personImage: personImage })
        .set('Cookie', response.headers['set-cookie'][0]);
      expect(verification.status).toBe(204);

      // Let the user pay so that he participates in the game 
      const payment = await request(app)
      .post('/payments/pay')
      .send({ paymentMethod: 'Paypal' })
      .set('Cookie', response.headers['set-cookie'][0]);

      expect(payment.status).toBe(200);

      const userKey = await getUserKeyFromSession(response.headers['set-cookie'][0]);

      users.push({
        userKey
      });
    }

    // Select the winner, pay out the prize pool and start a new game. Close the old game.
    await payoutAndStartNewGame();

    // Check if the new game is active and the old game is inactive
    const oldAndNewGame = await getLatestGamesBy();
    const newGame = oldAndNewGame[0];
    const oldGame = oldAndNewGame[1];
    expect(newGame.isActive).toBe(true);
    expect(oldGame.isActive).toBe(false);

    // Check if the winner is one of the users
    expect(users.map(user => user.userKey).includes(oldGame.winner)).toBe(true);
  });
});

export async function getLatestGamesBy() {
  const cursor: ArrayCursor<Game> = await db.query(/*aql*/`
        FOR game IN games
            SORT game.startDate DESC
            LIMIT 2
            RETURN KEEP(game, '_key', 'isActive', 'prizePool', 'startDate', 'endDate', 'winner')
        `);
  return cursor.all();
}
