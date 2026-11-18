import { streamPrivateUpload } from "../../services/upload/streamPrivateUpload.js";

/**
 * Staff-only: `GET /upload/private/:filename`
 */
export async function getPrivateUploadController(req, res) {
  await streamPrivateUpload({
    filenameRaw: req.params.filename,
    res,
  });
}
