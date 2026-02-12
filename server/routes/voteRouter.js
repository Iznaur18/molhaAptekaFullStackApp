import { Router } from 'express';
import { userVoteRatingController, userGetRatingController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';

const router = Router();

// путь в index.js начинается с /vote
router.get('/rating/:userIdClient', userGetRatingController);
router.post('/:userVoteTargetIdClient', checkAuthMW, userVoteRatingController);

export { router as voteRouter };
