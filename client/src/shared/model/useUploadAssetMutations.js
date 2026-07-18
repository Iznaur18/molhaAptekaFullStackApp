import { useMutation } from "@tanstack/react-query";

import { uploadImage } from "../api/uploadImage.js";
import { uploadVideo } from "../api/uploadVideo.js";

export function useUploadAssetMutations() {
  const uploadImageMutation = useMutation({
    mutationFn: (variables) => {
      if (variables instanceof File) {
        return uploadImage(variables);
      }
      return uploadImage(variables?.file ?? variables, variables?.purpose);
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: (variables) => {
      const file = variables?.file ?? variables;
      const purpose = variables?.purpose;
      return uploadVideo(file, purpose ? { purpose } : {});
    },
  });

  return {
    uploadImageMutation,
    uploadVideoMutation,
  };
}
