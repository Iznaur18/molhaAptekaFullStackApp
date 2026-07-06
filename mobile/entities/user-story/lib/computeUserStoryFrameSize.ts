/** Паритет с `.user-story-viewer__frame` в web (`height: 100%`, `aspect-ratio: 9/16`). */
export const USER_STORY_FRAME_ASPECT_WIDTH = 9;
export const USER_STORY_FRAME_ASPECT_HEIGHT = 16;

export const USER_STORY_FRAME_ASPECT_RATIO =
  USER_STORY_FRAME_ASPECT_WIDTH / USER_STORY_FRAME_ASPECT_HEIGHT;

export const CREATE_STORY_MODAL_HORIZONTAL_PADDING_PX = 40;
export const CREATE_STORY_MODAL_PREVIEW_CHROME_RESERVE_PX = 320;
export const CREATE_STORY_MODAL_MAX_HEIGHT_RATIO = 0.92;
/** Компактная миниатюра в форме опубликованного сторис (9:16), не full-bleed. */
export const CREATE_STORY_MODAL_PREVIEW_MAX_HEIGHT_PX = 220;

export const computeCreateStoryPreviewSize = (
  windowWidth: number,
  windowHeight: number,
): { width: number; height: number } => {
  const contentWidth = Math.max(
    windowWidth - CREATE_STORY_MODAL_HORIZONTAL_PADDING_PX,
    0,
  );
  const maxFrameHeight = Math.max(
    windowHeight * CREATE_STORY_MODAL_MAX_HEIGHT_RATIO -
      CREATE_STORY_MODAL_PREVIEW_CHROME_RESERVE_PX,
    0,
  );

  const fitted = computeUserStoryFrameSize(contentWidth, maxFrameHeight);
  if (fitted.height <= CREATE_STORY_MODAL_PREVIEW_MAX_HEIGHT_PX) {
    return fitted;
  }

  const height = CREATE_STORY_MODAL_PREVIEW_MAX_HEIGHT_PX;
  return {
    width: (height * USER_STORY_FRAME_ASPECT_WIDTH) / USER_STORY_FRAME_ASPECT_HEIGHT,
    height,
  };
};

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
