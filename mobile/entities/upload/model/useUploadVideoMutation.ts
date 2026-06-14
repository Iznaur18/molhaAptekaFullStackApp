import { useMutation } from "@tanstack/react-query";

import { uploadVideo, type UploadVideoFilePayload } from "../api/uploadVideo";

export const useUploadVideoMutation = () =>
  useMutation({
    mutationFn: (file: UploadVideoFilePayload) => uploadVideo(file),
  });
