import request from 'supertest';
import app from '../../../app';

const date = Date.now();

describe('Insert and get satellite data', () => {
    it('Create, login, insert, get satellite data, logout, and try to get data with old session ID.', async () => {
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
        expect(responseLogin.body.message).toBe('Login successful');
        expect(responseLogin.headers['set-cookie'][0].length).toBeGreaterThan(1);

        await request(app)
            .post('/satellites')
            .send({
                satelliteName: "ISS"
            }).set('Cookie', responseLogin.headers['set-cookie']);

        const responseGetSatelliteDataWithSessionId = await request(app)
            .get('/satellites')
            .set('Cookie', responseLogin.headers['set-cookie']);

        expect(responseGetSatelliteDataWithSessionId.status).toBe(200);
        expect(responseGetSatelliteDataWithSessionId.body[0].satelliteName).toBe('ISS');

        // try to insert a satellite without sessionId
        const responseInsertSatelliteDataWithoutSessionId = await request(app)
            .post('/satellites')
            .send({
                satelliteName: "ISS"
            });
        expect(responseInsertSatelliteDataWithoutSessionId.status).toBe(401);
        
        // try to get all of the satellites without sessionId
        const responseGetSatelliteDataWithoutSessionId = await request(app)
            .get('/satellites');
        expect(responseGetSatelliteDataWithoutSessionId.status).toBe(401);

        // logout the user and then try to get the satellite data with the old session ID
        await request(app)
            .post('/users/logout')
            .set('Cookie', responseLogin.headers['set-cookie']);

        // try to get all of the satellites without sessionId
        const responseGetSatelliteDataWithOldSessionId = await request(app)
            .get('/satellites')
            .set('Cookie', responseLogin.headers['set-cookie']);
        expect(responseGetSatelliteDataWithOldSessionId.status).toBe(401);
    });
});
