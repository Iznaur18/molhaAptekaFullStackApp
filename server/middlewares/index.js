import { uploadMW } from './uploadMW.js';
import { checkAuthMW } from './checkAuthMW.js';
import { generalRateLimiter, authRateLimiter, updateProfileRateLimiter, voteRateLimiter, uploadRateLimiter } from './rateLimitMW.js';
import { errorHandler, notFoundHandler, asyncHandler, AppError } from './errorHandlerMW.js';

export { 
    uploadMW, 
    checkAuthMW,
    generalRateLimiter,
    authRateLimiter,
    updateProfileRateLimiter,
    voteRateLimiter,
    uploadRateLimiter,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError
}; // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);