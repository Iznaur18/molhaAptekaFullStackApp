import { body } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const makeProductValidation = [
    body('productName')
        .notEmpty()
        .withMessage('Название продукта обязательно')
        .isLength({ min: 3 })
        .withMessage('Название продукта должно быть не менее 3 символов')
        .trim(),
    body('productDescription')
        .notEmpty()
        .withMessage('Описание продукта обязательно')
        .isLength({ min: 10 })
        .withMessage('Описание продукта должно быть не менее 10 символов')
        .trim(),
    body('productPrice')
        .notEmpty()
        .withMessage('Цена продукта обязательна')
        .isFloat({ min: 0 })
        .withMessage('Цена продукта должна быть положительным числом')
        .toFloat(),
    body('productCategory')
        .notEmpty()
        .withMessage('Категория продукта обязательна')
        .isIn(['electronics', 'clothing', 'food'])
        .withMessage('Категория продукта должна быть одной из: electronics, clothing, food')
        .trim(),
    body('productIsAvailable')
        .notEmpty()
        .withMessage('Доступность продукта обязательна')
        .isBoolean()
        .withMessage('Доступность продукта должна быть булевым значением')
        .trim(),
    handleValidationByExpressErrors
];