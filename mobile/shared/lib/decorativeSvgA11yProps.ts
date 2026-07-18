import { Platform } from "react-native";
import type { SvgProps } from "react-native-svg";

/**
 * Пропсы для декоративных SVG-иконок, которые нужно скрыть от скринридера.
 *
 * На web react-native-svg прокидывает `accessible` напрямую в DOM `<svg>`,
 * из-за чего React ругается на нестроковый DOM-атрибут
 * («Received `false` for a non-boolean attribute `accessible`»). Поэтому на web
 * используем валидный `aria-hidden`, а на нативе — `accessible={false}`.
 */
export const decorativeSvgA11yProps: Pick<SvgProps, "accessible"> =
  Platform.OS === "web"
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ "aria-hidden": true } as any)
    : { accessible: false };
