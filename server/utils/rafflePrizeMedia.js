import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
  RAFFLE_PRIZE_MEDIA_TYPES,
} from '../constants/raffleConstants.js';
import { normalizeStoredUploadUrl } from './buildPublicUploadUrl.js';
import { normalizeRafflePrizeImageFocus } from './profileImageFocus.js';

const isHttpUrl = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return /^https?:\/\/.+/i.test(trimmed);
};

const isUploadAssetUrl = (value) => {
  if (typeof value !== 'string') return false;
  return value.trim().startsWith('/uploads/');
};

const isMediaUrl = (value) => isHttpUrl(value) || isUploadAssetUrl(value);

/**
 * @param {unknown} raw
 */
export function normalizePrizeMediaType(raw) {
  const value = String(raw ?? RAFFLE_PRIZE_MEDIA_TYPE_IMAGE).trim();
  if (RAFFLE_PRIZE_MEDIA_TYPES.includes(value)) {
    return value;
  }
  return RAFFLE_PRIZE_MEDIA_TYPE_IMAGE;
}

/**
 * @param {unknown} value
 */
export function assertDirectVideoUrl(value) {
  if (!isMediaUrl(value)) {
    throw new Error('Укажите корректную ссылку на видео (http/https)');
  }
  const trimmed = String(value).trim();
  const lower = trimmed.toLowerCase();
  const isUploadedAsset = lower.includes('/uploads/');
  const isDirectFile = /\.(mp4|webm)(\?|#|$)/i.test(trimmed);
  if (!isUploadedAsset && !isDirectFile) {
    throw new Error('Видео: прямая ссылка на MP4 или WebM, либо файл с сервера');
  }
}

/**
 * @param {Record<string, unknown>} body
 */
export function assertRaffleCreatePrizeMedia(body) {
  const type = normalizePrizeMediaType(body.prizeMediaType);
  if (type === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE) {
    const url = String(body.prizeImageUrl ?? '').trim();
    if (!url) {
      throw new Error('Добавьте фото приза');
    }
    if (!isMediaUrl(url)) {
      throw new Error('Укажите корректную ссылку на изображение');
    }
    return;
  }

  const videoUrl = String(body.prizeVideoUrl ?? '').trim();
  if (!videoUrl) {
    throw new Error('Добавьте видео приза');
  }
  assertDirectVideoUrl(videoUrl);
}

/**
 * @param {{ prizeMediaType?: unknown; prizeImageUrl?: unknown; prizeVideoUrl?: unknown }} raffle
 */
export function assertRafflePrizeMediaComplete(raffle) {
  const type = normalizePrizeMediaType(raffle.prizeMediaType);
  if (type === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE) {
    const url = String(raffle.prizeImageUrl ?? '').trim();
    if (!url) {
      throw new Error('Добавьте фото приза');
    }
    if (!isMediaUrl(url)) {
      throw new Error('Укажите корректную ссылку на изображение');
    }
    return;
  }

  const videoUrl = String(raffle.prizeVideoUrl ?? '').trim();
  if (!videoUrl) {
    throw new Error('Добавьте видео приза');
  }
  assertDirectVideoUrl(videoUrl);
}

/**
 * @param {import('mongoose').Document} raffle
 * @param {Record<string, unknown>} body
 */
export function applyRafflePrizeMediaFields(raffle, body) {
  if (body.prizeMediaType !== undefined) {
    raffle.prizeMediaType = normalizePrizeMediaType(body.prizeMediaType);
  }

  if (body.prizeImageUrl !== undefined) {
    const nextUrl = normalizeStoredUploadUrl(String(body.prizeImageUrl).trim());
    const urlChanged = nextUrl !== raffle.prizeImageUrl;
    raffle.prizeImageUrl = nextUrl;
    if (urlChanged && body.prizeImageFocus === undefined) {
      raffle.prizeImageFocus = normalizeRafflePrizeImageFocus(null);
    }
  }

  if (body.prizeVideoUrl !== undefined) {
    raffle.prizeVideoUrl = normalizeStoredUploadUrl(String(body.prizeVideoUrl).trim());
  }

  if (body.prizeImageFocus !== undefined) {
    raffle.prizeImageFocus = normalizeRafflePrizeImageFocus(body.prizeImageFocus);
  }
}
