import express, {Request, Response, NextFunction} from 'express';
import { createNewUserQuery, getUserByUsernameQuery } from './usersQueries';
import bcrypt from 'bcrypt';

const router = express.Router();

const SALT_ROUNDS = 10;

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user in the database after validating and hashing the password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       204:
 *         description: User registered successfully
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }

  // Check if the user already exists
  const userExists = await getUserByUsernameQuery(username);
  if (userExists) {
    res.status(409).json({ message: 'User already exists.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Register the new user
  await createNewUserQuery(username, email, hashedPassword);
  res.status(204).send();
});

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user with a username and password. Returns a session cookie in the response header.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserLoginResponse'
 *       default:
 *         $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }

  // Fetch user from database
  const user = await getUserByUsernameQuery(username);
  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHashed);
  if (!passwordMatch) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  req.session.userKey = user._key; //Here is the sessionId created in Redis.

  res.status(200).json({ message: 'Login successful' });
});

/**
 * @openapi
 * /users/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the user by destroying the session.
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserLogoutResponse'
 *       default:
 *         $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to logout' });
    } else {
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logout successful' });
    }
  });
});

export default router;
