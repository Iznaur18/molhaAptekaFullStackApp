import { Router } from 'express';
import { userVoteRatingController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';

const router = Router();

router.post('/vote/:userVoteTargetIdClient', checkAuthMW, userVoteRatingController);

export { router as voteRouter };
