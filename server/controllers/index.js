import { uploadController } from './uploadController.js';
import { registerUserController } from './registerUserController.js';
import { loginUserController } from './loginUserController.js';
import { authTelegramController } from './authTelegramController.js';

export { uploadController, registerUserController, loginUserController, authTelegramController }; // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);