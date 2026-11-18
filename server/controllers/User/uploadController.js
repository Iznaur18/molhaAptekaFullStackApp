import { successRes } from "../../services/http/index.js";
import { uploadImage } from "../../services/upload/uploadImage.js";

export async function uploadController(req, res) {
  const data = await uploadImage({
    file: req.file,
    uploaderId: String(req.userId),
    purpose: req.query?.purpose,
  });
  return successRes(res, data);
}
