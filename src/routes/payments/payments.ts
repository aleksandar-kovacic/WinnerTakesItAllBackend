import express, { Request, Response } from 'express';
import { addUserToGame, alreadyPayedBy, isVerifiedBy } from './paymentsQueries';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * /payments/pay:
 *   post:
 *     summary: Make a payment and participate in the game
 *     description: Allows an authenticated user to make a payment and participate in the active game.
 *     tags: [Payments]
 *     parameters:
 *       - $ref: '#/components/parameters/Cookie'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentMethod'
 *     responses:
 *       200:
 *         description: Payment successful and participation recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.post('/pay', isAuthenticated, async (req: Request, res: Response) => {
    const userKey = req.session.userKey;
    const { paymentMethod } = req.body;

    if (!userKey) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    // TODO: Check that the user is not in OASIS (i.e. banned)
    const isVerified = await isVerifiedBy(userKey);
    if(!isVerified) {
        res.status(400).json({ message: 'User is not verified' });
        return;
    }

    // Check if user has already paid
    const alreadyPaid = await alreadyPayedBy(userKey);
    if(alreadyPaid) {
        res.status(400).json({ message: 'User has already paid' });
        return;
    }

    // TODO : Implement payment logic here (e.g., PayPal, Apple Pay)
    const paymentSuccessful = await thirdPartyPaymentProcess(userKey, paymentMethod);

    if (paymentSuccessful) {
        await addUserToGame(userKey, 1);
        res.status(200).json({ message: 'Payment successful and participation recorded' });
    } else {
        res.status(400).json({ message: 'Payment failed' });
    }
});

async function thirdPartyPaymentProcess(userKey: string, paymentMethod: string): Promise<boolean> {
    return true;
}

export default router;
