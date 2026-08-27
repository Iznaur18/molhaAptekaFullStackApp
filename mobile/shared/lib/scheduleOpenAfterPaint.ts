/** Mount → paint closed → open (паритет web scheduleOpenAfterPaint). */
export const scheduleOpenAfterPaint = (onOpen: () => void): (() => void) => {
  let innerFrame = 0;
  const outerFrame = requestAnimationFrame(() => {
    innerFrame = requestAnimationFrame(onOpen);
  });

  return () => {
    cancelAnimationFrame(outerFrame);
    if (innerFrame) {
      cancelAnimationFrame(innerFrame);
    }
  };
};
