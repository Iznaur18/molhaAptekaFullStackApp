import { Router } from 'express';
import { userVoteRatingController, userGetRatingController } from '../controllers/index.js';
import { checkAuthMW, voteRateLimiter } from '../middlewares/index.js';
import { voteValidation, voteTargetIdParamValidation, ratingUserIdParamValidation } from '../validations/index.js';

const router = Router();

// путь в index.js начинается с /vote
router.get('/rating/:userIdClient', ratingUserIdParamValidation, userGetRatingController);

// Rate limiting для голосований (защита от накрутки рейтинга)
router.post('/:userVoteTargetIdClient', voteRateLimiter, checkAuthMW, voteTargetIdParamValidation, voteValidation, userVoteRatingController);

export { router as voteRouter };
