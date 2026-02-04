import { uploadMW } from './uploadMW.js';
import { checkAuthMW } from './checkAuthMW.js';

export { uploadMW, checkAuthMW }; // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);