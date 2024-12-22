import request from 'supertest';
import app from '../../../app';
import { db } from "../../../database/arango";
import { ArrayCursor } from "arangojs/cursor";
import { getUserKeyFromSession } from '../../../database/redis';

const date = Date.now();

describe('test payment functionality', () => {
    it('register and login user and pay for a game', async () => {
        // First, register the user
        await request(app)
            .post('/users/register')
            .send({
                username: `testUser-${date}`,
                email: 'testUser@example.com',
                password: 'Passw0rd!',
            });

        // Then, login with the same credentials
        const responseLogin = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
                password: 'Passw0rd!',
            });

        expect(responseLogin.status).toBe(200);
        expect(responseLogin.headers['set-cookie'][0].length).toBeGreaterThan(1);
        
        // Let the user pay so that he participates in the game 
        const payment = await request(app)
            .post('/payments/pay')
            .send({ paymentMethod: 'Paypal' })
            .set('Cookie', responseLogin.headers['set-cookie']);

        expect(payment.status).toBe(200);
        
        // Get the user key from the session cookie and check if the new user is connected to the active game.
        const userKey = await getUserKeyFromSession(responseLogin.headers['set-cookie'][0]);
        const isUserConnectedToActiveGame = await userConnectedToActiveGame(userKey);
        expect(isUserConnectedToActiveGame).toBe(true);
    });
});

// Helper function to check if the new user is connected to the active game
async function userConnectedToActiveGame(userKey: string) {
    const cursor: ArrayCursor<boolean> = await db.query(/*aql*/`
        LET activeGame = (
            FOR game IN games
                FILTER game.isActive == true
                RETURN game
            )[0]
        
        FILTER ASSERT(activeGame._id != NULL, '404_GAME_NOT_FOUND')
        
        // Check that the edge between user and the active game exists.
        LET user = DOCUMENT('users', @userKey)
        LET edgeExists = LENGTH(
            FOR v, e IN OUTBOUND user users2games
                FILTER e._to == activeGame._id
                RETURN e 
            ) > 0
        
        RETURN edgeExists
    `, { userKey });
    return cursor.next();
}
