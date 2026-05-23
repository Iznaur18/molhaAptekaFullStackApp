/** Поля продавца в карточке/модалке товара (без секретов). */
export const PRODUCT_SELLER_PUBLIC_FIELD_NAMES = [
    '_id',
    'userName',
    'email',
    'userPhoneNumber',
    'userAddress',
    'userRatingByVotes',
    'isPremiumUser',
    'isUserDataConfirmed',
    'createdAt',
];

export const PRODUCT_SELLER_PUBLIC_SELECT =
    PRODUCT_SELLER_PUBLIC_FIELD_NAMES.join(' ');
