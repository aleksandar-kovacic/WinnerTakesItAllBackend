import request from 'supertest';
import app from '../../../app';

const date = Date.now();

describe('POST /users/login', () => {
    it('should login successfully with correct credentials', async () => {
        // First, register the user
        await request(app)
            .post('/users/register')
            .send({
                username: `testUser-${date}`,
                email: 'testUser@example.com',
                password: 'Passw0rd!',
            });

        // Then, login with the same credentials
        const response = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
                password: 'Passw0rd!',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.headers['set-cookie'][0].length).toBeGreaterThan(1);
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required.');
    });

    it('should return 401 if credentials are incorrect', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
                password: 'WrongPassword!',
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');
    });
});
