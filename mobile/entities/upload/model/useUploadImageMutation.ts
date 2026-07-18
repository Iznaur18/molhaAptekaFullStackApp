import { useMutation } from "@tanstack/react-query";

import { uploadImage, type UploadImageFilePayload } from "@/entities/upload/api/uploadImage";

export const useUploadImageMutation = () =>
  useMutation({
    mutationFn: (variables: UploadImageFilePayload | { file: UploadImageFilePayload; purpose?: string }) => {
      if ("file" in variables && variables.file) {
        return uploadImage(variables.file, variables.purpose);
      }
      return uploadImage(variables as UploadImageFilePayload);
    },
  });
