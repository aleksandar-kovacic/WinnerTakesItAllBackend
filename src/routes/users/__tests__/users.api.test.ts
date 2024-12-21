import request from 'supertest';
import app from '../../../app';

const date = Date.now();

describe('POST /users/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({
        username: `testUser-${date}`,
        email: 'testUser@example.com',
        password: 'Passw0rd!',
      });

    expect(response.status).toBe(204);
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({
        username: `testUser-${date}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required.');
  });

  it('should return 409 if the user already exists', async () => {
    // First, register the user
    await request(app)
      .post('/users/register')
      .send({
        username: `testUser-${date}`,
        email: 'testUser@example.com',
        password: 'Passw0rd!',
      });

    // Try to register the same user again
    const response = await request(app)
      .post('/users/register')
      .send({
        username: `testUser-${date}`,
        email: 'testUser@example.com',
        password: 'Passw0rd!',
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User already exists.');
  });
});
