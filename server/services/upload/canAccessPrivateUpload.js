import { ORDER_STATUS_CANCELLED } from "../../constants/orderConstants.js";
import { OrderModel, ProductModel, UserModel } from "../../models/index.js";
import { canModerateProductsRole } from "../product/productModeration.js";
import { buildPrivateUploadApiUrl } from "./privateUploadPaths.js";
import { isPrivateUploadOwnedBy } from "./privateUploadOwnership.js";

/**
 * @param {string} value
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Staff/moderator — любой private file.
 * Загрузивший — свой же файл.
 * Продавец — только если selfie есть в незакрытой рассрочной заявке по его товару.
 *
 * @param {string} userId
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
export async function canAccessPrivateUpload(userId, filename) {
  const safeFilename = String(filename ?? "").trim();
  if (!safeFilename || !userId) {
    return false;
  }

  const user = await UserModel.findById(userId)
    .select("userRole courierProfile")
    .lean();
  if (!user) {
    return false;
  }
  if (canModerateProductsRole(user.userRole)) {
    return true;
  }

  const selfieUrl = buildPrivateUploadApiUrl(safeFilename);

  // Свой же файл видно всегда: курьер при переподаче должен понимать, что
  // именно он приложил.
  if (await isPrivateUploadOwnedBy(userId, safeFilename)) {
    return true;
  }

  // Файлы, загруженные до появления реестра владельцев, опознаём по ссылке
  // в собственной заявке.
  const courierProfile = user.courierProfile ?? {};
  const ownCourierDocument = [
    courierProfile.vehiclePhotoFrontUrl,
    courierProfile.vehiclePhotoRearUrl,
    courierProfile.driverLicensePhotoUrl,
    courierProfile.vehicleRegistrationPhotoUrl,
  ].some((url) => String(url ?? "") === selfieUrl);
  if (ownCourierDocument) {
    return true;
  }
  const filenameSuffixRe = new RegExp(`${escapeRegex(`/${safeFilename}`)}$`, "i");

  const orders = await OrderModel.find({
    status: { $ne: ORDER_STATUS_CANCELLED },
    $or: [
      { "buyerPassportShare.passportSelfiePhotoUrl": selfieUrl },
      { "buyerPassportShare.passportSelfiePhotoUrl": filenameSuffixRe },
    ],
  })
    .select("items.productId items.status")
    .lean();

  if (orders.length === 0) {
    return false;
  }

  const productIds = [];
  for (const order of orders) {
    for (const item of order.items ?? []) {
      if (item?.status === ORDER_STATUS_CANCELLED) {
        continue;
      }
      if (item?.productId) {
        productIds.push(item.productId);
      }
    }
  }

  if (productIds.length === 0) {
    return false;
  }

  const ownedProduct = await ProductModel.exists({
    _id: { $in: productIds },
    productSeller: userId,
  });

  return Boolean(ownedProduct);
}
