import { useRowVisibility } from "@/shared/model/rowVisibility";
import { LoopingCoverVideo } from "@/shared/ui/LoopingCoverVideo";
import { StyleSheet, View } from "react-native";

type ProductPreviewVideoProps = {
  uri: string;
  loop?: boolean;
  onPlaybackFailed?: () => void;
  onReady?: () => void;
  onEnded?: () => void;
};

/**
 * Превью без hit-testing: native/HTML video на Android/web перехватывает тапы
 * и ломает Pressable карточки. Касания уходят родителю.
 */
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
    <View style={styles.wrap} pointerEvents="none">
      <LoopingCoverVideo
        uri={uri}
        loop={loop}
        isMuted
        isPlaying={isVisible}
        onPlaybackFailed={onPlaybackFailed}
        onReady={onReady}
        onEnded={onEnded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: "100%",
  },
});
