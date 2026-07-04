import { useMutation } from "@tanstack/react-query";

import {
  uploadVideo,
  type UploadVideoFilePayload,
  type UploadVideoPurpose,
} from "../api/uploadVideo";

type UploadVideoVariables = UploadVideoFilePayload & {
  purpose?: UploadVideoPurpose;
};

export const useUploadVideoMutation = () =>
  useMutation({
    mutationFn: ({ purpose, ...file }: UploadVideoVariables) =>
      uploadVideo(file, { purpose }),
  });
