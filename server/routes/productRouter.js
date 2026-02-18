import { Router } from 'express';
import { postProductController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';

const router = Router();

// в index.js с /product
router.post('/', checkAuthMW, postProductController); // POST /product — создание нового продукта

export { router as productRouter };