import mongoose from 'mongoose';

import {
    INSTALLMENT_CONTRACT_STATUS_ACTIVE,
    INSTALLMENT_CONTRACT_STATUS_CANCELLED,
    INSTALLMENT_CONTRACT_STATUS_COMPLETED,
    INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
    INSTALLMENT_DISPUTE_STATUS_OPEN,
    INSTALLMENT_DISPUTE_STATUS_RESOLVED,
    INSTALLMENT_MODERATION_APPROVED,
    INSTALLMENT_PAYMENT_STATUS_DUE,
    INSTALLMENT_PAYMENT_STATUS_OVERDUE,
    INSTALLMENT_PAYMENT_STATUS_PAID,
    INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
    INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
    INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE,
    IN_APP_NOTIFICATION_KIND_INSTALLMENT_DISPUTE_OPENED,
    IN_APP_NOTIFICATION_KIND_INSTALLMENT_SELLER_MESSAGE,
} from '../../constants/installmentConstants.js';
import { ORDER_STATUS_PENDING } from '../../constants/orderConstants.js';
import {
    buildOrderLineLoyaltySnapshot,
    reserveLoyaltyPointsForNewOrder,
} from '../../utils/orderLoyaltyPoints.js';
import { cancelLinkedOrderForInstallmentContract } from '../../utils/cancelLinkedOrderForInstallmentContract.js';
import { runInTransaction, withMongoSession } from '../../utils/mongoTransaction.js';
import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import {
    InstallmentContractModel,
    InstallmentDisputeModel,
    OrderModel,
    ProductInstallmentProgramModel,
    ProductModel,
    UserModel,
} from '../../models/index.js';
import { isUserAdmin, isUserStaff } from '../../utils/adminUserGuard.js';
import { assertUserCanBuyInstallment } from '../../utils/installmentAccess.js';
import { checkUserEmailVerified } from '../../utils/assertEmailVerified.js';
import {
    applyConfirmedInstallmentPayment,
    buildInstallmentPaymentSchedule,
    canBuyerMarkInstallmentPayment,
    isEarlyPayoffPendingConfirmation,
    notifySellerEarlyPayoff,
    repairInstallmentPaymentStatusDrift,
    revertInstallmentPaymentsAfterEarlyPayoffCancel,
    rejectInstallmentPaymentPendingConfirmation,
    notifySellerNewInstallmentContract,
    recomputeContractOverdueFlags,
    resolveContractStatusAfterPayment,
    buildInstallmentContractPayload,
    buildInstallmentContractPayloads,
    countInstallmentBuyerActionItems,
    countInstallmentSellerActionItems,
    resolveInstallmentContractStatusQuery,
} from '../../utils/installmentHelpers.js';
import { createUserInAppNotification } from '../../utils/userInAppNotifications.js';
import { assertOrderItemsWithinAvailableStock } from '../../utils/productStock.js';
import { errorRes, successRes } from '../../utils/index.js';
import { buildOrderStatusFromItems } from '../Order/orderStatus.js';
import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from '../Order/orderQueries.js';

const ACTIVE_STATUSES = [
    INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
    INSTALLMENT_CONTRACT_STATUS_ACTIVE,
];

const appendOrderToBuyList = async (userId, orderId, session) => {
    const user = await UserModel.findById(userId).session(session);
    if (!user) return false;
    const safeBuyList = Array.isArray(user.buyList)
        ? user.buyList.filter((id) => mongoose.isValidObjectId(id))
        : [];
    user.buyList = [...safeBuyList, orderId];
    await user.save({ validateBeforeSave: false, session });
    return true;
};

/** `POST /product/:productId/installment-contracts` */
export const createInstallmentContractController = async (req, res) => {
    try {
        const buyerUserId = req.userId;
        const { productId } = req.params;
        const { planId, quantity, paymentMethod } = req.body;
        const verified = req.verifiedDeliveryAddress;

        try {
            await assertUserCanBuyInstallment(buyerUserId);
        } catch (e) {
            return errorRes(
                res,
                403,
                e instanceof Error ? e.message : 'Нет прав',
            );
        }

        const emailCheck = await checkUserEmailVerified(buyerUserId);
        if (!emailCheck.ok) {
            return errorRes(res, 403, emailCheck.message);
        }

        const program = await ProductInstallmentProgramModel.findOne({
            productId,
            isEnabled: true,
            moderationStatus: INSTALLMENT_MODERATION_APPROVED,
        });
        if (!program || program.plans.length === 0) {
            return errorRes(res, 404, INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE);
        }

        const plan = program.plans.id(planId);
        if (!plan) {
            return errorRes(res, 404, 'План рассрочки не найден');
        }

        const product = await ProductModel.findOne({
            _id: productId,
            productModerationStatus: PRODUCT_MODERATION_APPROVED,
            productIsAvailable: { $ne: false },
            productStockQuantity: { $gt: 0 },
        }).lean();

        if (!product) {
            return errorRes(res, 404, 'Товар недоступен');
        }
        if (String(product.productSeller) === String(buyerUserId)) {
            return errorRes(res, 400, 'Нельзя купить свой товар');
        }

        const items = [{ productId, quantity }];
        try {
            await assertOrderItemsWithinAvailableStock(items, buyerUserId);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Недостаточно товара',
            );
        }

        const firstPaymentRequiredNow = plan.firstPaymentRequiredNow !== false;

        const schedule = buildInstallmentPaymentSchedule({
            plan: {
                title: plan.title,
                monthsCount: plan.monthsCount,
                monthlyAmountRub: plan.monthlyAmountRub,
                firstPaymentRequiredNow,
            },
            quantity,
        });

        const startsActive = !firstPaymentRequiredNow;

        const loyaltyLine = buildOrderLineLoyaltySnapshot({
            loyaltyPointsPerUnit: product.loyaltyPointsPerUnit,
            quantity,
        });
        const orderItems = [
            {
                productId,
                quantity,
                unitPriceAtOrder: product.productPrice,
                productNameAtOrder: product.productName,
                ...loyaltyLine,
            },
        ];
        const itemsForReserve = [
            {
                ...orderItems[0],
                productId: { productSeller: product.productSeller },
            },
        ];

        let contract;
        let order;

        try {
            ({ contract, order } = await runInTransaction(async (session) => {
                await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);

                const [createdContract] = await InstallmentContractModel.create(
                    [
                        {
                            productId,
                            programId: program._id,
                            planId: plan._id,
                            buyerUserId,
                            sellerUserId: product.productSeller,
                            quantity,
                            planTitle: plan.title,
                            monthsCount: plan.monthsCount,
                            monthlyPaymentRub: schedule.monthlyPaymentRub,
                            totalAmountRub: schedule.totalAmountRub,
                            paidAmountRub: 0,
                            productNameAtContract: product.productName,
                            productUnitPriceAtContract: product.productPrice,
                            status: startsActive
                                ? INSTALLMENT_CONTRACT_STATUS_ACTIVE
                                : INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
                            payments: schedule.payments,
                            finalDueAt: schedule.finalDueAt,
                            nextPaymentDueAt: schedule.nextPaymentDueAt,
                        },
                    ],
                    withMongoSession({}, session),
                );

                const [createdOrder] = await OrderModel.create(
                    [
                        {
                            userBuyerId: buyerUserId,
                            items: orderItems,
                            totalAmount: product.productPrice * quantity,
                            deliveryAddress: verified.displayAddress,
                            deliveryAddressFlat: verified.flat,
                            deliveryAddressFiasId: verified.fiasId,
                            paymentMethod,
                            status: ORDER_STATUS_PENDING,
                            installmentContractId: createdContract._id,
                        },
                    ],
                    withMongoSession({}, session),
                );

                createdContract.orderId = createdOrder._id;
                await createdContract.save({ session });

                const isUserUpdated = await appendOrderToBuyList(
                    buyerUserId,
                    createdOrder._id,
                    session,
                );
                if (!isUserUpdated) {
                    throw new Error('USER_NOT_FOUND');
                }

                return { contract: createdContract, order: createdOrder };
            }));
        } catch (txError) {
            if (txError instanceof Error && txError.message === 'USER_NOT_FOUND') {
                return errorRes(res, 404, 'Пользователь не найден');
            }
            const message =
                txError instanceof Error
                    ? txError.message
                    : 'Недостаточно баллов у продавца';
            return errorRes(res, 400, message);
        }
        await notifySellerNewInstallmentContract(
            String(product.productSeller),
            productId,
            product.productName,
        );

        await order.populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS);
        await order.populate(ORDER_ITEMS_POPULATE);

        return successRes(res, {
            message: 'Рассрочка оформлена',
            contract: await buildInstallmentContractPayload(contract),
            order,
        });
    } catch (error) {
        console.error('createInstallmentContractController error:', error);
        return errorRes(res, 500, 'Ошибка при оформлении рассрочки');
    }
};

/** `GET /installment/contracts/my` */
export const getMyInstallmentContractsController = async (req, res) => {
    try {
        const statusFilter =
            typeof req.query.status === 'string' && req.query.status.trim() !== ''
                ? req.query.status.trim()
                : undefined;

        const rows = await InstallmentContractModel.find({
            buyerUserId: req.userId,
            ...resolveInstallmentContractStatusQuery(statusFilter),
        }).sort({ createdAt: -1 });

        for (const row of rows) {
            await repairInstallmentPaymentStatusDrift(row);
        }

        return successRes(res, {
            contracts: await buildInstallmentContractPayloads(rows),
        });
    } catch (error) {
        console.error('getMyInstallmentContractsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке рассрочек');
    }
};

/** `GET /installment/contracts/sales` */
export const getMyInstallmentSalesController = async (req, res) => {
    try {
        const statusFilter =
            typeof req.query.status === 'string' && req.query.status.trim() !== ''
                ? req.query.status.trim()
                : undefined;

        const rows = await InstallmentContractModel.find({
            sellerUserId: req.userId,
            ...resolveInstallmentContractStatusQuery(statusFilter),
        }).sort({ createdAt: -1 });

        for (const row of rows) {
            await repairInstallmentPaymentStatusDrift(row);
        }

        return successRes(res, {
            contracts: await buildInstallmentContractPayloads(rows),
        });
    } catch (error) {
        console.error('getMyInstallmentSalesController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке продаж');
    }
};

/**
 * @param {import('mongoose').Document} contract
 * @param {number} paymentIndex
 */
const findContractPayment = (contract, paymentIndex) =>
    contract.payments.find(
        (row) => row.paymentIndex === Number(paymentIndex),
    );

/** `PATCH /installment/contracts/:contractId/payments/:paymentIndex/mark-paid` */
export const markInstallmentPaymentPaidController = async (req, res) => {
    try {
        const { contractId, paymentIndex } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }
        await repairInstallmentPaymentStatusDrift(contract);
        if (String(contract.buyerUserId) !== String(req.userId)) {
            return errorRes(res, 403, 'Нет прав');
        }
        if (!ACTIVE_STATUSES.includes(contract.status)) {
            return errorRes(res, 409, 'Контракт не активен');
        }

        const payment = findContractPayment(contract, paymentIndex);
        if (!payment) {
            return errorRes(res, 404, 'Платёж не найден');
        }
        if (
            payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION
        ) {
            return successRes(res, {
                message: 'Ожидает подтверждения продавца',
                contract: await buildInstallmentContractPayload(contract),
            });
        }

        if (!canBuyerMarkInstallmentPayment(contract, payment)) {
            return errorRes(res, 409, 'Платёж нельзя отметить сейчас');
        }

        payment.status = INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
        payment.buyerMarkedPaidAt = new Date();
        contract.markModified('payments');
        await contract.save();

        return successRes(res, {
            message: 'Ожидает подтверждения продавца',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('markInstallmentPaymentPaidController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/payments/:paymentIndex/reject` */
export const rejectInstallmentPaymentController = async (req, res) => {
    try {
        const { contractId, paymentIndex } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        const isSeller = String(contract.sellerUserId) === String(req.userId);
        const isAdmin = await isUserAdmin(req.userId);
        if (!isSeller && !isAdmin) {
            return errorRes(res, 403, 'Нет прав');
        }
        if (!ACTIVE_STATUSES.includes(contract.status)) {
            return errorRes(res, 409, 'Контракт не активен');
        }

        try {
            rejectInstallmentPaymentPendingConfirmation(
                contract,
                paymentIndex,
            );
        } catch (e) {
            return errorRes(
                res,
                409,
                e instanceof Error ? e.message : 'Платёж нельзя отклонить',
            );
        }

        contract.markModified('payments');
        await contract.save();

        return successRes(res, {
            message: 'Оплата отклонена',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('rejectInstallmentPaymentController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/pay-early/reject` */
export const rejectInstallmentEarlyPayoffController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        const isSeller = String(contract.sellerUserId) === String(req.userId);
        const isAdmin = await isUserAdmin(req.userId);
        if (!isSeller && !isAdmin) {
            return errorRes(res, 403, 'Нет прав');
        }
        if (!ACTIVE_STATUSES.includes(contract.status)) {
            return errorRes(res, 409, 'Контракт не активен');
        }
        if (!isEarlyPayoffPendingConfirmation(contract)) {
            return errorRes(
                res,
                409,
                'Нет досрочного погашения для отклонения',
            );
        }

        revertInstallmentPaymentsAfterEarlyPayoffCancel(contract);
        contract.markModified('payments');
        await contract.save();

        return successRes(res, {
            message: 'Досрочное погашение отклонено',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('rejectInstallmentEarlyPayoffController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/payments/:paymentIndex/confirm` */
export const confirmInstallmentPaymentController = async (req, res) => {
    try {
        const { contractId, paymentIndex } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        const isSeller = String(contract.sellerUserId) === String(req.userId);
        const isAdmin = await isUserAdmin(req.userId);
        if (!isSeller && !isAdmin) {
            return errorRes(res, 403, 'Нет прав');
        }

        const payment = findContractPayment(contract, Number(paymentIndex));
        if (!payment) {
            return errorRes(res, 404, 'Платёж не найден');
        }
        if (payment.status !== INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
            return errorRes(res, 409, 'Платёж не ожидает подтверждения');
        }

        const paidAt = new Date();
        payment.confirmedByUserId = req.userId;
        applyConfirmedInstallmentPayment(contract, payment.paymentIndex, paidAt);
        await contract.save();

        return successRes(res, {
            message: 'Платёж подтверждён',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('confirmInstallmentPaymentController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/pay-early` */
export const markInstallmentEarlyPayoffController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }
        if (String(contract.buyerUserId) !== String(req.userId)) {
            return errorRes(res, 403, 'Нет прав');
        }
        if (!ACTIVE_STATUSES.includes(contract.status)) {
            return errorRes(res, 409, 'Контракт не активен');
        }

        const remaining = (contract.payments ?? []).filter(
            (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
        );
        if (remaining.length === 0) {
            return errorRes(res, 409, 'Долг уже погашен');
        }

        for (const payment of remaining) {
            payment.status = INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
            payment.buyerMarkedPaidAt = new Date();
        }
        contract.markModified('payments');
        await contract.save();

        return successRes(res, {
            message: 'Досрочное погашение ожидает подтверждения',
            contract: await buildInstallmentContractPayload(contract),
            remainingAmountRub: remaining.reduce(
                (sum, payment) => sum + payment.amountRub,
                0,
            ),
        });
    } catch (error) {
        console.error('markInstallmentEarlyPayoffController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/pay-early/cancel` */
export const cancelInstallmentEarlyPayoffController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }
        if (String(contract.buyerUserId) !== String(req.userId)) {
            return errorRes(res, 403, 'Нет прав');
        }
        if (!ACTIVE_STATUSES.includes(contract.status)) {
            return errorRes(res, 409, 'Контракт не активен');
        }
        if (!isEarlyPayoffPendingConfirmation(contract)) {
            return errorRes(
                res,
                409,
                'Нет досрочного погашения для отмены',
            );
        }

        revertInstallmentPaymentsAfterEarlyPayoffCancel(contract);
        contract.markModified('payments');
        await contract.save();

        return successRes(res, {
            message: 'Досрочное погашение отменено',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('cancelInstallmentEarlyPayoffController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/pay-early/confirm` */
export const confirmInstallmentEarlyPayoffController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        const isSeller = String(contract.sellerUserId) === String(req.userId);
        const isAdmin = await isUserAdmin(req.userId);
        if (!isSeller && !isAdmin) {
            return errorRes(res, 403, 'Нет прав');
        }

        const pending = (contract.payments ?? []).filter(
            (payment) =>
                payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
        );
        if (pending.length === 0) {
            return errorRes(res, 409, 'Нет ожидающих платежей');
        }

        const paidAt = new Date();
        for (const payment of pending) {
            payment.status = INSTALLMENT_PAYMENT_STATUS_PAID;
            payment.paidAt = paidAt;
            payment.confirmedByUserId = req.userId;
            contract.paidAmountRub =
                (Number(contract.paidAmountRub) || 0) +
                (Number(payment.amountRub) || 0);
        }

        contract.status = INSTALLMENT_CONTRACT_STATUS_COMPLETED;
        contract.completedAt = paidAt;
        contract.nextPaymentDueAt = null;
        contract.hasOverduePayment = false;
        await contract.save();

        await notifySellerEarlyPayoff(
            String(contract.sellerUserId),
            String(contract.productId),
        );

        return successRes(res, {
            message: 'Досрочное погашение подтверждено',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('confirmInstallmentEarlyPayoffController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/contracts/:contractId/cancel` */
export const cancelInstallmentContractController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const reason = String(req.body?.reason ?? '').trim();
        const contract = await InstallmentContractModel.findById(contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        const isBuyer = String(contract.buyerUserId) === String(req.userId);
        const isSeller = String(contract.sellerUserId) === String(req.userId);
        const isAdmin = await isUserAdmin(req.userId);

        if (!isBuyer && !isSeller && !isAdmin) {
            return errorRes(res, 403, 'Нет прав');
        }

        if (contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
            return errorRes(res, 409, 'Контракт уже закрыт');
        }
        if (contract.status === INSTALLMENT_CONTRACT_STATUS_CANCELLED) {
            return errorRes(res, 409, 'Контракт уже отменён');
        }

        await runInTransaction(async (session) => {
            contract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
            contract.cancelledAt = new Date();
            contract.cancelledByUserId = req.userId;
            contract.cancellationReason = reason;
            await contract.save({ session });
            await cancelLinkedOrderForInstallmentContract(contract.orderId, session);
        });

        return successRes(res, {
            message: 'Контракт отменён',
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        console.error('cancelInstallmentContractController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `POST /installment/contracts/:contractId/message` */
export const sendInstallmentSellerMessageController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const message = String(req.body?.message ?? '').trim();
        const contract = await InstallmentContractModel.findById(contractId).lean();
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }
        if (String(contract.sellerUserId) !== String(req.userId)) {
            return errorRes(res, 403, 'Нет прав');
        }

        await createUserInAppNotification({
            userId: contract.buyerUserId,
            kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_SELLER_MESSAGE,
            message,
            productId: contract.productId,
            actorUserId: req.userId,
        });

        return successRes(res, { message: 'Сообщение отправлено' });
    } catch (error) {
        console.error('sendInstallmentSellerMessageController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `POST /installment/contracts/:contractId/dispute` */
export const openInstallmentDisputeController = async (req, res) => {
    try {
        const { contractId } = req.params;
        const reason = String(req.body?.reason ?? '').trim();
        const contract = await InstallmentContractModel.findById(contractId).lean();
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        const isBuyer = String(contract.buyerUserId) === String(req.userId);
        const isSeller = String(contract.sellerUserId) === String(req.userId);
        if (!isBuyer && !isSeller) {
            return errorRes(res, 403, 'Нет прав');
        }

        const existing = await InstallmentDisputeModel.findOne({
            contractId,
            status: INSTALLMENT_DISPUTE_STATUS_OPEN,
        });
        if (existing) {
            return errorRes(res, 409, 'Спор уже открыт');
        }

        const dispute = await InstallmentDisputeModel.create({
            contractId,
            openedByUserId: req.userId,
            reason,
        });

        const staffIds = await UserModel.find({
            userRole: { $in: ['admin', 'moderator'] },
            isBlockedUser: { $ne: true },
        })
            .select('_id')
            .lean();

        await Promise.all(
            staffIds.map((staff) =>
                createUserInAppNotification({
                    userId: staff._id,
                    kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_DISPUTE_OPENED,
                    message: reason,
                    productId: contract.productId,
                    actorUserId: req.userId,
                }),
            ),
        );

        return successRes(res, {
            message: 'Спор открыт',
            dispute: {
                _id: String(dispute._id),
                contractId: String(dispute.contractId),
                status: dispute.status,
                reason: dispute.reason,
                createdAt: dispute.createdAt,
            },
        });
    } catch (error) {
        console.error('openInstallmentDisputeController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `GET /installment/disputes/pending` */
export const getPendingInstallmentDisputesController = async (req, res) => {
    try {
        const rows = await InstallmentDisputeModel.find({
            status: INSTALLMENT_DISPUTE_STATUS_OPEN,
        })
            .sort({ createdAt: 1 })
            .lean();

        return successRes(res, {
            disputes: rows.map((row) => ({
                _id: String(row._id),
                contractId: String(row.contractId),
                openedByUserId: String(row.openedByUserId),
                reason: row.reason,
                status: row.status,
                createdAt: row.createdAt,
            })),
        });
    } catch (error) {
        console.error('getPendingInstallmentDisputesController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `GET /installment/disputes/pending/count` */
export const getPendingInstallmentDisputesCountController = async (req, res) => {
    try {
        const count = await InstallmentDisputeModel.countDocuments({
            status: INSTALLMENT_DISPUTE_STATUS_OPEN,
        });
        return successRes(res, { count });
    } catch (error) {
        console.error('getPendingInstallmentDisputesCountController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `GET /installment/contracts/my/action-count` */
export const getInstallmentBuyerActionCountController = async (req, res) => {
    try {
        const count = await countInstallmentBuyerActionItems(req.userId);
        return successRes(res, { count });
    } catch (error) {
        console.error('getInstallmentBuyerActionCountController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `GET /installment/contracts/sales/action-count` */
export const getInstallmentSellerActionCountController = async (req, res) => {
    try {
        const count = await countInstallmentSellerActionItems(req.userId);
        return successRes(res, { count });
    } catch (error) {
        console.error('getInstallmentSellerActionCountController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /installment/disputes/:disputeId/resolve` */
export const resolveInstallmentDisputeController = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { action, resolutionNote, partialRefundRub } = req.body;

        const dispute = await InstallmentDisputeModel.findById(disputeId);
        if (!dispute) {
            return errorRes(res, 404, 'Спор не найден');
        }
        if (dispute.status !== INSTALLMENT_DISPUTE_STATUS_OPEN) {
            return errorRes(res, 409, 'Спор уже закрыт');
        }

        const contract = await InstallmentContractModel.findById(dispute.contractId);
        if (!contract) {
            return errorRes(res, 404, 'Контракт не найден');
        }

        await runInTransaction(async (session) => {
            if (action === 'cancel') {
                contract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
                contract.cancelledAt = new Date();
                contract.cancelledByUserId = req.userId;
                contract.cancellationReason = resolutionNote ?? '';
                await contract.save({ session });
                await cancelLinkedOrderForInstallmentContract(
                    contract.orderId,
                    session,
                );
            } else if (action === 'close') {
                contract.status = INSTALLMENT_CONTRACT_STATUS_COMPLETED;
                contract.completedAt = new Date();
                contract.nextPaymentDueAt = null;
                contract.hasOverduePayment = false;
                await contract.save({ session });
            } else if (action === 'partial_refund') {
                const amount = Math.floor(Number(partialRefundRub));
                if (!Number.isFinite(amount) || amount <= 0) {
                    throw new Error('INVALID_PARTIAL_REFUND');
                }
                contract.totalAmountRub = Math.max(
                    contract.paidAmountRub,
                    (Number(contract.totalAmountRub) || 0) - amount,
                );
                resolveContractStatusAfterPayment(contract);
                await contract.save({ session });
            } else if (action === 'adjust_schedule') {
                const nextDue = contract.payments.find(
                    (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
                );
                if (nextDue) {
                    nextDue.dueAt = new Date(
                        nextDue.dueAt.getTime() + 30 * 24 * 60 * 60 * 1000,
                    );
                }
                recomputeContractOverdueFlags(contract);
                await contract.save({ session });
            }

            dispute.status = INSTALLMENT_DISPUTE_STATUS_RESOLVED;
            dispute.resolutionNote = String(resolutionNote ?? '').trim();
            dispute.resolvedByUserId = req.userId;
            dispute.resolvedAt = new Date();
            await dispute.save({ session });
        });

        return successRes(res, {
            message: 'Спор рассмотрен',
            dispute: {
                _id: String(dispute._id),
                status: dispute.status,
                resolutionNote: dispute.resolutionNote,
            },
            contract: await buildInstallmentContractPayload(contract),
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_PARTIAL_REFUND') {
            return errorRes(res, 400, 'Укажите сумму частичного возврата');
        }
        console.error('resolveInstallmentDisputeController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};
