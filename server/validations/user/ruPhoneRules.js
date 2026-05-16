/** После нормализации: +7 и 10 цифр, мобильный — вторая цифра 9 */
export const RU_PHONE_E164_REGEX = /^\+79\d{9}$/;

/** РФ: 7XXXXXXXXXX (без +) */
export const RU_PHONE_MAX_DIGITS = 11;

/**
 * @param {unknown} raw
 * @returns {string | undefined}
 */
export function normalizeRuPhoneInput(raw) {
    if (raw == null) return undefined;
    const trimmed = String(raw).trim();
    if (trimmed === '') return undefined;

    let digits = trimmed.replace(/\D/g, '');
    if (digits === '') {
        throw new Error('Номер телефона должен содержать цифры');
    }
    if (digits.length > RU_PHONE_MAX_DIGITS) {
        throw new Error(`Номер не может содержать больше ${RU_PHONE_MAX_DIGITS} цифр`);
    }
    if (digits.length === 10 && digits.startsWith('9')) {
        digits = `7${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('8')) {
        digits = `7${digits.slice(1)}`;
    }
    return `+${digits}`;
}

/**
 * @param {string} normalized
 */
export function assertRuPhoneFormat(normalized) {
    if (typeof normalized !== 'string') {
        throw new Error('Номер телефона должен быть строкой');
    }
    if (!RU_PHONE_E164_REGEX.test(normalized)) {
        throw new Error(
            'Номер РФ: +7 9XX XXX XX XX (можно 8…, 9XXXXXXXXX или с пробелами/скобками)',
        );
    }
}
