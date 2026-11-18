import { successRes } from "../../services/http/index.js";
import { resolveVideoUploadProfile } from "../../services/upload/resolveVideoUploadProfile.js";
import { uploadVideo } from "../../services/upload/uploadVideo.js";

export async function uploadVideoController(req, res) {
  const data = await uploadVideo({
    file: req.file,
    transcodeOptions: resolveVideoUploadProfile(req).transcodeOptions,
  });
  return successRes(res, data);
}
