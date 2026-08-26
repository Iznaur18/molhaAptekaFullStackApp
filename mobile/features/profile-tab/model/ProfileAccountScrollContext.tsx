import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const PROFILE_ACCOUNT_NEAR_END_PX = 320;

type NearEndHandler = () => void;

export type ProfileAccountScrollContextValue = {
  /** Desktop shell: один ScrollView на layout (паритет web my-profile-page__layout). */
  outerScrollOwns: boolean;
  registerNearEndHandler: (handler: NearEndHandler | null) => void;
  handleOuterScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const ProfileAccountScrollContext = createContext<ProfileAccountScrollContextValue>({
  outerScrollOwns: false,
  registerNearEndHandler: () => {},
  handleOuterScroll: () => {},
});

export const useProfileAccountScroll = (): ProfileAccountScrollContextValue =>
  useContext(ProfileAccountScrollContext);

/** Nested FlatList/ScrollView внутри ProfileAccountShell (desktop). */
export const useProfileAccountNestedListScroll = () => {
  const { outerScrollOwns, registerNearEndHandler } = useProfileAccountScroll();

  const resolveListStyle = useCallback(
    (fillStyle: StyleProp<ViewStyle>): StyleProp<ViewStyle> => {
      if (!outerScrollOwns) {
        return fillStyle;
      }
      // Outer shell ScrollView owns scroll — list must size to content, not flex:1 viewport.
      return [{ width: "100%", alignSelf: "stretch" }, fillStyle, { flexGrow: 0, flex: 0 }];
    },
    [outerScrollOwns],
  );

  return {
    outerScrollOwns,
    scrollEnabled: !outerScrollOwns,
    resolveListStyle,
    registerNearEndHandler,
  };
};

type ProfileAccountScrollProviderProps = {
  outerScrollOwns: boolean;
  children: ReactNode;
};

export const ProfileAccountScrollProvider = ({
  outerScrollOwns,
  children,
}: ProfileAccountScrollProviderProps) => {
  const nearEndHandlerRef: RefObject<NearEndHandler | null> = useRef(null);

  const registerNearEndHandler = useCallback((handler: NearEndHandler | null) => {
    nearEndHandlerRef.current = handler;
  }, []);

  const handleOuterScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!outerScrollOwns) {
        return;
      }
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromEnd =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);
      if (distanceFromEnd > PROFILE_ACCOUNT_NEAR_END_PX) {
        return;
      }
      nearEndHandlerRef.current?.();
    },
    [outerScrollOwns],
  );

  const value = useMemo(
    (): ProfileAccountScrollContextValue => ({
      outerScrollOwns,
      registerNearEndHandler,
      handleOuterScroll,
    }),
    [outerScrollOwns, registerNearEndHandler, handleOuterScroll],
  );

  return (
    <ProfileAccountScrollContext.Provider value={value}>
      {children}
    </ProfileAccountScrollContext.Provider>
  );
};
