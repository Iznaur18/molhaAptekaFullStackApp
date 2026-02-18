import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({ // схема заказа
    userBuyerId: { // id пользователя который сделал заказ
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: { // позиции заказа: товар и количество
        type: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
        }],
        required: true,
    },
    totalAmount: { // общая сумма заказа
        type: Number,
        required: true,
    },
    deliveryAddress: { // адрес доставки
        type: String,
        required: true,
    },
    deliveryDate: { // дата доставки
        type: Date,
        required: true,
    },
    paymentMethod: { // метод оплаты
        type: String,
        required: true,
    },
    status: { // статус заказа
        type: String,
        required: true,
    },
}, {
    timestamps: true, // когда заказ создан/обновлен
});

export default mongoose.model('Order', OrderSchema);