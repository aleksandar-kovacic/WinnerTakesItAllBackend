import express, { Request, Response } from 'express';
import { isAuthenticated } from '../../middleware/authMiddleware';
import { isBannedBy, banUserBy, unbanUserBy } from './oasisBanQueries';

const router = express.Router();

/**
 * @openapi
 * /ban/oasis-ban:
 *   post:
 *     summary: Ban a user by adding them to the OASIS database.
 *     description: Allows an authenticated user to ban themselves by adding them to the OASIS database.
 *     tags: [Ban]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BanUser'
 *     responses:
 *       204:
 *         description: User successfully banned
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/oasis-ban', isAuthenticated, async (req: Request, res: Response) => {
    const userKey = req.session.userKey;
    const { name } = req.body;

    if (!userKey) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    //TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
    //Check if user is already in OASIS
    const alreadyBanned = await isBannedBy(userKey);
    if (alreadyBanned) {
        res.status(400).json({ message: 'User is already banned' });
        return;
    }

    //Add user to OASIS or other ban system
    //TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
    await banUserBy(userKey);

    res.status(204).send();
});

/**
 * @openapi
 * /ban/oasis-unban:
 *   post:
 *     summary: Unban a user by removing them from the OASIS database.
 *     description: Allows an authenticated user to unban themselves by removing them from the OASIS database.
 *     tags: [Ban]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BanUser'
 *     responses:
 *       204:
 *         description: User successfully unbanned
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/oasis-unban', isAuthenticated, async (req: Request, res: Response) => {
    const userKey = req.session.userKey;
    const { name } = req.body;

    if (!userKey) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    //TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
    // Check if user is already unbanned
    const alreadyBanned = await isBannedBy(userKey);
    if (!alreadyBanned) {
        res.status(400).json({ message: 'User is already unbanned' });
        return;
    }

    //TODO: Currently the ban state of a player is handled in the arango database. Replace this query if OASIS or other ban system is implemented.
    // Remove user from OASIS or other ban system
    await unbanUserBy(userKey);

    res.status(204).send();
});

export default router;
