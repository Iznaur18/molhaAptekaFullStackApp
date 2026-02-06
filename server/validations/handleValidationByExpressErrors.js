import { validationResult } from 'express-validator';

export const handleValidationByExpressErrors = (req, res, next) => { // функция для обработки ошибок валидации
    const errors = validationResult(req); // получаем ошибки валидации
    if (!errors.isEmpty()) { // если есть ошибки, возвращаем ошибку
        return res.status(400).json({ errors: errors.array() }); // возвращаем ошибку
    }
    next(); // продолжаем выполнение следующего middleware
}