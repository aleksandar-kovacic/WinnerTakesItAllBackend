import express, { Request, Response, NextFunction } from 'express';
import { createSatelliteData, getSatelliteDataByUser } from './satellitesQueries';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * /satellites:
 *   post:
 *     summary: Post satellite data
 *     description: Posts satellite data to the database. Requires authentication.
 *     tags: [Satellite]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/PostSatellite'
 *     responses:
 *       204:
 *         description: Satellite data posted successfully
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
    const { satelliteName } = req.body;
    const userKey = req.session.userKey;

    if (!userKey) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    await createSatelliteData(userKey, satelliteName);
    res.status(204).send();
});

/**
 * @openapi
 * /satellites:
 *   get:
 *     summary: Get satellite data
 *     description: Gets the data of all satellites as an array for the authenticated user.
 *     tags: [Satellite]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     responses:
 *       200:
 *         description: Satellite data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetSatellites'
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
    const userKey = req.session.userKey;

    if (!userKey) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }
    const data = await getSatelliteDataByUser(userKey);
    res.status(200).json(data);
});

export default router;
