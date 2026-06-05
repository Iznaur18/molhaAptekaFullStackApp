import "./UserPremiumUi.css";

/**
 * @param {{
 *   src: string;
 *   alt?: string;
 *   className?: string;
 *   isPremium?: boolean;
 *   objectPosition?: string;
 *   onError?: () => void;
 *   loading?: "lazy" | "eager";
 *   decoding?: "async" | "sync" | "auto";
 *   referrerPolicy?: string;
 *   width?: number;
 *   height?: number;
 * }} props
 */
export function UserPremiumAvatar({
  src,
  alt = "",
  className = "",
  isPremium = false,
  objectPosition,
  onError,
  loading,
  decoding,
  referrerPolicy,
  width,
  height,
}) {
  const imgClass = [className, isPremium ? "user-premium-avatar" : ""]
    .filter(Boolean)
    .join(" ");

  const imgStyle =
    objectPosition != null && objectPosition !== "" ? { objectPosition } : undefined;

  return (
    <img
      className={imgClass}
      src={src}
      alt={alt}
      style={imgStyle}
      decoding={decoding}
      loading={loading}
      referrerPolicy={referrerPolicy}
      width={width}
      height={height}
      onError={onError}
    />
  );
}
