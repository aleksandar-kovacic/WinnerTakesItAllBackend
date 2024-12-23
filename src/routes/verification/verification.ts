import express, { Request, Response } from 'express';
import { alreadyVerifiedBy, verifyUserBy } from './verificationQueries';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * /verification/verify:
 *   post:
 *     summary: Verify a user's identity
 *     description: Allows an authenticated user to verify their identity.
 *     tags: [Verification]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Verification'
 *     responses:
 *       204:
 *         description: Verification successful
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/verify', isAuthenticated, async (req: Request, res: Response) => {
    const userKey = req.session.userKey;
    const { idFrontImage, personImage } = req.body;

    if (!userKey) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    //Check if the user is already verified
    const alreadyVerified = await alreadyVerifiedBy(userKey);
    if(alreadyVerified) {
        res.status(400).json({ message: 'User is already verified' });
        return;
    }

    // TODO: Implement third-party verification process
    const verificationSuccessful = await thirdPartyVerificationProcess(userKey, idFrontImage, personImage);

    // Update user's verification status in the database
    await verifyUserBy(userKey);

    if (verificationSuccessful) {
        res.status(204).end();
    } else {
        res.status(400).json({ message: 'Verification failed' });
    }
});

async function thirdPartyVerificationProcess(userKey: string, idFrontImage: string, personImage: string): Promise<boolean> {
    return true;
}

export default router;
