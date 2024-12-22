import express, { Request, Response } from 'express';
import { addUserToGame, alreadyPayed } from './paymentsQueries';
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
    // TODO: Check that user if verified (i.e. age and personal information)

    // Check if user has already paid
    const alreadyPaid = await alreadyPayed(userKey);
    if(alreadyPaid) {
        res.status(400).json({ message: 'User has already paid' });
        return;
    }

    // TODO : Implement payment logic here (e.g., PayPal, Apple Pay)
    const paymentSuccessful = true; // Replace with actual payment logic

    if (paymentSuccessful) {
        await addUserToGame(userKey, 1);
        res.status(200).json({ message: 'Payment successful and participation recorded' });
    } else {
        res.status(400).json({ message: 'Payment failed' });
    }
});

export default router;
