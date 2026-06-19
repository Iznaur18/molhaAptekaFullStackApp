/** Паритет с `.user-story-viewer__frame` в web (`height: 100%`, `aspect-ratio: 9/16`). */
export const USER_STORY_FRAME_ASPECT_WIDTH = 9;
export const USER_STORY_FRAME_ASPECT_HEIGHT = 16;

export const computeUserStoryFrameSize = (
  viewportWidth: number,
  viewportHeight: number,
): { width: number; height: number } => {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return { width: 0, height: 0 };
  }
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return { width: 0, height: 0 };
  }

  const heightFirst = viewportHeight;
  let width =
    (heightFirst * USER_STORY_FRAME_ASPECT_WIDTH) / USER_STORY_FRAME_ASPECT_HEIGHT;

  if (width <= viewportWidth) {
    return { width, height: heightFirst };
  }

  width = viewportWidth;
  return {
    width,
    height: (width * USER_STORY_FRAME_ASPECT_HEIGHT) / USER_STORY_FRAME_ASPECT_WIDTH,
  };
};
