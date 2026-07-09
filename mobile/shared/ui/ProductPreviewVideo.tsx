import { LoopingCoverVideo } from "@/shared/ui/LoopingCoverVideo";

type ProductPreviewVideoProps = {
  uri: string;
  loop?: boolean;
  onPlaybackFailed?: () => void;
  onReady?: () => void;
  onEnded?: () => void;
};

export const ProductPreviewVideo = ({
  uri,
  loop = true,
  onPlaybackFailed,
  onReady,
  onEnded,
}: ProductPreviewVideoProps) => (
  <LoopingCoverVideo
    uri={uri}
    loop={loop}
    isMuted
    onPlaybackFailed={onPlaybackFailed}
    onReady={onReady}
    onEnded={onEnded}
  />
);
