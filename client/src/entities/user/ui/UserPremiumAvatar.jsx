import "./UserPremiumUi.css";

/**
 * @param {{
 *   src: string;
 *   alt?: string;
 *   className?: string;
 *   isPremium?: boolean;
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
  onError,
  loading,
  decoding,
  referrerPolicy,
  width,
  height,
}) {
  const imgClass = [
    className,
    isPremium ? "user-premium-avatar" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      className={imgClass}
      src={src}
      alt={alt}
      decoding={decoding}
      loading={loading}
      referrerPolicy={referrerPolicy}
      width={width}
      height={height}
      onError={onError}
    />
  );
}
