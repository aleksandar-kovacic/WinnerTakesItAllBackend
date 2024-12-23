import request from 'supertest';
import app from '../../../app';
import { db } from "../../../database/arango";
import { ArrayCursor } from "arangojs/cursor";
import { getUserKeyFromSession } from '../../../database/redis';
import fs from 'fs';
import path from 'path';

const date = Date.now();

describe('test verification functionality', () => {
    it('register and login user and verify user', async () => {
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

        // Get the user key from the session cookie
        const userKey = await getUserKeyFromSession(responseLogin.headers['set-cookie'][0]);

        expect(await isUserVerified(userKey)).toBe(false);

        //Convert jpg to base64
        const idFrontImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/idFrontImageExample.jpg')).toString('base64');
        const personImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/personImageExample.jpg')).toString('base64');

        //Verify the user
        const verification = await request(app)
        .post('/verification/verify')
        .send({ idFrontImage: idFrontImage, personImage: personImage })
        .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(verification.status).toBe(204);

        expect(await isUserVerified(userKey)).toBe(true);
    });
});

// Helper function to check the users verification status
async function isUserVerified(userKey: string) {
    const cursor: ArrayCursor<boolean> = await db.query(/*aql*/`
        LET user = DOCUMENT('users', @userKey)
        FILTER ASSERT(user != NULL, '404_USER_NOT_FOUND')
        RETURN user.verified
    `, { userKey });
    return cursor.next();
}
