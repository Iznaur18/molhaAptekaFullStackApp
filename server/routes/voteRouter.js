import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  userVoteRatingController,
  userGetRatingController,
  getMyVoteForTargetController,
} from "../controllers/index.js";
import { checkAuthMW, voteRateLimiter } from "../middlewares/index.js";
import {
  voteValidation,
  voteTargetIdParamValidation,
  ratingUserIdParamValidation,
} from "../validations/index.js";

const router = createAsyncRouter();

// путь в index.js начинается с /vote
router.get(
  "/rating/:userIdClient",
  ratingUserIdParamValidation,
  userGetRatingController,
);

router.get(
  "/me/:userVoteTargetIdClient",
  checkAuthMW,
  voteTargetIdParamValidation,
  getMyVoteForTargetController,
);

// Rate limiting для голосований (защита от накрутки рейтинга)
router.post(
  "/:userVoteTargetIdClient",
  voteRateLimiter,
  checkAuthMW,
  voteTargetIdParamValidation,
  voteValidation,
  userVoteRatingController,
);

export { router as voteRouter };
