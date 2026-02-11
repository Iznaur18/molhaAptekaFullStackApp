import { Router } from 'express';
import { userVoteRatingController, userGetRatingController, userGetProfileController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';

const router = Router();

// путь в index.js начинается с /user
router.get('/rating/:userIdClient', userGetRatingController);
router.get('/:userIdClient', userGetProfileController);
router.post('/vote/:userVoteTargetIdClient', checkAuthMW, userVoteRatingController);

export { router as voteRouter };
