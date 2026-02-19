import { Router } from 'express';
import { postProductController, getProductsController, getMyProductsController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';
import { makeProductValidation } from '../validations/index.js';

const router = Router();

// в index.js с /product
router.post('/', checkAuthMW, makeProductValidation, postProductController); // POST /product — создание нового продукта
router.get('/', getProductsController); // GET /product — получение всех продуктов
router.get('/my', checkAuthMW, getMyProductsController); // GET /product/my — получение своих продуктов
export { router as productRouter };