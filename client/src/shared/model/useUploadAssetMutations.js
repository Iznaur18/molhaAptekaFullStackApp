import { useMutation } from "@tanstack/react-query";

import { uploadImage } from "../api/uploadImage.js";
import { uploadVideo } from "../api/uploadVideo.js";

export function useUploadAssetMutations() {
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
  });

  const uploadVideoMutation = useMutation({
    mutationFn: uploadVideo,
  });

  return {
    uploadImageMutation,
    uploadVideoMutation,
  };
}
