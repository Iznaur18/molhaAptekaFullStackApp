import { useRowVisibility } from "@/shared/model/rowVisibility";
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
}: ProductPreviewVideoProps) => {
  // В ленте карточка сообщает свою видимость: ушло за экран или экран потерял
  // фокус — видео на паузе, декодер не греет CPU/GPU. Вне ленты (детальный
  // экран и пр.) провайдера нет → isVisible === true, поведение как раньше.
  const isVisible = useRowVisibility();

  return (
    <LoopingCoverVideo
      uri={uri}
      loop={loop}
      isMuted
      isPlaying={isVisible}
      onPlaybackFailed={onPlaybackFailed}
      onReady={onReady}
      onEnded={onEnded}
    />
  );
};
