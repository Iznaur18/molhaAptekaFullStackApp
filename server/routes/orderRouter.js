import { Router } from 'express';
import { makeOrderController, getMyOrdersController, getAllOrdersController } from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';

const router = Router();

// Все заказы с привязкой к пользователю — только для админа (маршрут /all должен быть выше /)
// router.get('/all', checkAuthMW, getAllOrdersController);
router.get('/all', getAllOrdersController);
router.get('/', checkAuthMW, getMyOrdersController); // в index.js с /order
router.post('/', checkAuthMW, makeOrderController);

export { router as orderRouter };