import { uploadController } from './uploadController.js';

export { uploadController }; // Получаем в файле routes/uploadRouter.js и используем в router.post('/', uploadMW.single('image'), uploadController);