import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { CREATE_USER_STORY_MODAL_ANIMATION } from "./createUserStoryModalAnimation.js";

/**
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useCreateUserStoryModalAnimation(isOpen) {
  return useEnterExitMountAnimation(isOpen, {
    exitMs: CREATE_USER_STORY_MODAL_ANIMATION.exitMs,
  });
}
