import { useMutation } from "@tanstack/react-query";

import { uploadImage, type UploadImageFilePayload } from "@/entities/upload/api/uploadImage";

export const useUploadImageMutation = () =>
  useMutation({
    mutationFn: (file: UploadImageFilePayload) => uploadImage(file),
  });
