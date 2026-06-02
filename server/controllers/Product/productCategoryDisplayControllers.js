import ProductCategoryDisplayModel from '../../models/ProductCategoryDisplayModel.js';
import { deleteUploadFileByUrl } from '../../utils/deleteUploadFileByUrl.js';
import { errorRes, successRes } from '../../utils/index.js';

/**
 * @param {import('mongoose').Document | Record<string, unknown> | null | undefined} row
 */
const toCategoryDisplayPayload = (row) => ({
    categorySlug: String(row?.categorySlug ?? ''),
    customLabel:
        typeof row?.customLabel === 'string' && row.customLabel.trim()
            ? row.customLabel.trim()
            : null,
    imageUrl:
        typeof row?.imageUrl === 'string' && row.imageUrl.trim()
            ? row.imageUrl.trim()
            : null,
    updatedAt: row?.updatedAt ?? null,
});

/** GET /product/category-displays — публичные переопределения подписи/картинки категорий. */
export async function getProductCategoryDisplaysController(_req, res) {
    try {
        const rows = await ProductCategoryDisplayModel.find().lean();
        successRes(res, {
            displays: rows.map(toCategoryDisplayPayload),
        });
    } catch (error) {
        return errorRes(
            res,
            500,
            error instanceof Error ? error.message : 'Не удалось загрузить категории',
        );
    }
}

/** PATCH /product/category-displays/:categorySlug — только admin. */
export async function patchProductCategoryDisplayController(req, res) {
    try {
        const categorySlug = String(req.params.categorySlug ?? '').trim();
        const { customLabel, imageUrl, resetCustomLabel, resetImageUrl } = req.body ?? {};

        const existing = await ProductCategoryDisplayModel.findOne({ categorySlug }).lean();

        /** @type {Record<string, unknown>} */
        const update = {
            updatedBy: req.userId,
        };

        if (resetCustomLabel === true) {
            update.customLabel = null;
        } else if (customLabel !== undefined) {
            const nextLabel =
                customLabel == null || String(customLabel).trim() === ''
                    ? null
                    : String(customLabel).trim();
            update.customLabel = nextLabel;
        }

        if (resetImageUrl === true) {
            if (existing?.imageUrl) {
                await deleteUploadFileByUrl(existing.imageUrl);
            }
            update.imageUrl = null;
        } else if (imageUrl !== undefined) {
            const nextUrl =
                imageUrl == null || String(imageUrl).trim() === ''
                    ? null
                    : String(imageUrl).trim();
            if (
                existing?.imageUrl &&
                nextUrl &&
                existing.imageUrl !== nextUrl
            ) {
                await deleteUploadFileByUrl(existing.imageUrl);
            }
            if (!nextUrl && existing?.imageUrl) {
                await deleteUploadFileByUrl(existing.imageUrl);
            }
            update.imageUrl = nextUrl;
        }

        const saved = await ProductCategoryDisplayModel.findOneAndUpdate(
            { categorySlug },
            { $set: update },
            { upsert: true, returnDocument: 'after', runValidators: true },
        ).lean();

        successRes(res, {
            display: toCategoryDisplayPayload(saved),
        });
    } catch (error) {
        return errorRes(
            res,
            500,
            error instanceof Error ? error.message : 'Не удалось сохранить категорию',
        );
    }
}
