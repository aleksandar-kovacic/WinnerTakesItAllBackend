import express, {Request, Response} from 'express';
import { getGameInformation } from './gamesQueries';

const router = express.Router();

/**
 * @openapi
 * /games/information:
 *   get:
 *     summary: Get information about the games.
 *     description: This includes the prize pool and the duration of the game.
 *     tags: [Games]
 *     responses:
 *       200:
 *          $ref: '#/components/responses/GameInformationResponse'
 *       default:
 *          $ref: '#/components/responses/DefaultErrorResponse'
 */
router.get('/information', async (req: Request, res: Response) => {

  const gameInformation = await getGameInformation();

  if (!gameInformation) {
    res.status(404).send({message: 'No active games found'});
    return;
  }

  res.status(200).send(gameInformation);
});

export default router;
