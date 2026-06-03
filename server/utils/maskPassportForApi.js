/**
 * @param {unknown} value
 */
export const maskPassportNumber = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '');
    if (digits.length === 0) {
        return '****';
    }
    if (digits.length <= 4) {
        return '****';
    }
    return `****${digits.slice(-4)}`;
};

/**
 * Паспорт для ответов API покупателю (без серии/номера).
 *
 * @param {Record<string, unknown> | null | undefined} passport
 */
export const maskPassportForBuyerApi = (passport) => {
    if (!passport || typeof passport !== 'object') {
        return null;
    }

    return {
        lastName: passport.lastName,
        firstName: passport.firstName,
        middleName: passport.middleName,
        birthDate: passport.birthDate,
        issuedBy: passport.issuedBy,
        departmentCode: passport.departmentCode,
        issuedAt: passport.issuedAt,
        series: '****',
        number: maskPassportNumber(passport.number),
    };
};

/**
 * @param {Record<string, unknown>} row
 */
export const sanitizeDataConfirmationRequestForBuyer = (row) => {
    if (!row || typeof row !== 'object') {
        return row;
    }

    const out = { ...row };
    delete out.passport;
    delete out.passportSelfiePhotoUrl;
    return out;
};
