import { SQUIRCLE_CORNER_SMOOTHING } from "@/shared/lib/squircle/squircleConstants";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
type Side = "top" | "left" | "right" | "bottom";

type SquirclePathInput = {
  width: number;
  height: number;
  cornerRadius?: number;
  topLeftCornerRadius?: number;
  topRightCornerRadius?: number;
  bottomRightCornerRadius?: number;
  bottomLeftCornerRadius?: number;
  cornerSmoothing?: number;
  preserveSmoothing?: boolean;
};

type CornerPathParams = {
  a: number;
  b: number;
  c: number;
  d: number;
  p: number;
  cornerRadius: number;
  arcSectionLength: number;
};

type NormalizedCorner = {
  radius: number;
  roundingAndSmoothingBudget: number;
};

const adjacentsByCorner: Record<Corner, Array<{ side: Side; corner: Corner }>> = {
  topLeft: [
    { corner: "topRight", side: "top" },
    { corner: "bottomLeft", side: "left" },
  ],
  topRight: [
    { corner: "topLeft", side: "top" },
    { corner: "bottomRight", side: "right" },
  ],
  bottomLeft: [
    { corner: "bottomRight", side: "bottom" },
    { corner: "topLeft", side: "left" },
  ],
  bottomRight: [
    { corner: "bottomLeft", side: "bottom" },
    { corner: "topRight", side: "right" },
  ],
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const rounded = (strings: TemplateStringsArray, ...values: number[]): string =>
  strings.reduce((acc, str, index) => {
    const value = values[index];
    if (typeof value === "number") {
      return `${acc}${str}${value.toFixed(4)}`;
    }
    return `${acc}${str}${value ?? ""}`;
  }, "");

const getPathParamsForCorner = ({
  cornerRadius,
  cornerSmoothing,
  preserveSmoothing,
  roundingAndSmoothingBudget,
}: {
  cornerRadius: number;
  cornerSmoothing: number;
  preserveSmoothing: boolean;
  roundingAndSmoothingBudget: number;
}): CornerPathParams => {
  let smoothing = cornerSmoothing;
  let p = (1 + smoothing) * cornerRadius;

  if (!preserveSmoothing) {
    const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
    smoothing = Math.min(smoothing, maxCornerSmoothing);
    p = Math.min(p, roundingAndSmoothingBudget);
  }

  const arcMeasure = 90 * (1 - smoothing);
  const arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * smoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));

  let b = (p - arcSectionLength - c - d) / 3;
  let a = 2 * b;

  if (preserveSmoothing && p > roundingAndSmoothingBudget) {
    const p1ToP3MaxDistance = roundingAndSmoothingBudget - d - arcSectionLength - c;
    const minA = p1ToP3MaxDistance / 6;
    const maxB = p1ToP3MaxDistance - minA;
    b = Math.min(b, maxB);
    a = p1ToP3MaxDistance - b;
    p = Math.min(p, roundingAndSmoothingBudget);
  }

  return { a, b, c, d, p, arcSectionLength, cornerRadius };
};

const distributeAndNormalize = ({
  topLeftCornerRadius,
  topRightCornerRadius,
  bottomRightCornerRadius,
  bottomLeftCornerRadius,
  width,
  height,
}: {
  topLeftCornerRadius: number;
  topRightCornerRadius: number;
  bottomRightCornerRadius: number;
  bottomLeftCornerRadius: number;
  width: number;
  height: number;
}) => {
  const roundingAndSmoothingBudgetMap: Record<Corner, number> = {
    topLeft: -1,
    topRight: -1,
    bottomLeft: -1,
    bottomRight: -1,
  };

  const cornerRadiusMap: Record<Corner, number> = {
    topLeft: topLeftCornerRadius,
    topRight: topRightCornerRadius,
    bottomLeft: bottomLeftCornerRadius,
    bottomRight: bottomRightCornerRadius,
  };

  Object.entries(cornerRadiusMap)
    .sort(([, left], [, right]) => right - left)
    .forEach(([cornerName, radius]) => {
      const corner = cornerName as Corner;
      const budget = Math.min(
        ...adjacentsByCorner[corner].map((adjacent) => {
          const adjacentCornerRadius = cornerRadiusMap[adjacent.corner];
          if (radius === 0 && adjacentCornerRadius === 0) {
            return 0;
          }

          const adjacentCornerBudget = roundingAndSmoothingBudgetMap[adjacent.corner];
          const sideLength =
            adjacent.side === "top" || adjacent.side === "bottom" ? width : height;

          if (adjacentCornerBudget >= 0) {
            return sideLength - roundingAndSmoothingBudgetMap[adjacent.corner];
          }

          return (radius / (radius + adjacentCornerRadius)) * sideLength;
        }),
      );

      roundingAndSmoothingBudgetMap[corner] = budget;
      cornerRadiusMap[corner] = Math.min(radius, budget);
    });

  return {
    topLeft: {
      radius: cornerRadiusMap.topLeft,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.topLeft,
    },
    topRight: {
      radius: cornerRadiusMap.topRight,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.topRight,
    },
    bottomLeft: {
      radius: cornerRadiusMap.bottomLeft,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.bottomLeft,
    },
    bottomRight: {
      radius: cornerRadiusMap.bottomRight,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.bottomRight,
    },
  };
};

const drawTopRightPath = (params: CornerPathParams) => {
  if (params.cornerRadius) {
    return rounded`
 c ${params.a} 0 ${params.a + params.b} 0 ${params.a + params.b + params.c} ${params.d}
 a ${params.cornerRadius} ${params.cornerRadius} 0 0 1 ${params.arcSectionLength} ${params.arcSectionLength}
 c ${params.d} ${params.c}
 ${params.d} ${params.b + params.c}
 ${params.d} ${params.a + params.b + params.c}`;
  }
  return rounded`l ${params.p} 0`;
};

const drawBottomRightPath = (params: CornerPathParams) => {
  if (params.cornerRadius) {
    return rounded`
 c 0 ${params.a}
 0 ${params.a + params.b}
 ${-params.d} ${params.a + params.b + params.c}
 a ${params.cornerRadius} ${params.cornerRadius} 0 0 1 -${params.arcSectionLength} ${params.arcSectionLength}
 c ${-params.c} ${params.d}
 ${-(params.b + params.c)} ${params.d}
 ${-(params.a + params.b + params.c)} ${params.d}`;
  }
  return rounded`l 0 ${params.p}`;
};

const drawBottomLeftPath = (params: CornerPathParams) => {
  if (params.cornerRadius) {
    return rounded`
 c ${-params.a} 0
 ${-(params.a + params.b)} 0
 ${-(params.a + params.b + params.c)} ${-params.d}
 a ${params.cornerRadius} ${params.cornerRadius} 0 0 1 -${params.arcSectionLength} -${params.arcSectionLength}
 c ${-params.d} ${-params.c}
 ${-params.d} ${-(params.b + params.c)}
 ${-params.d} ${-(params.a + params.b + params.c)}`;
  }
  return rounded`l ${-params.p} 0`;
};

const drawTopLeftPath = (params: CornerPathParams) => {
  if (params.cornerRadius) {
    return rounded`
 c 0 ${-params.a}
 0 ${-(params.a + params.b)}
 ${params.d} ${-(params.a + params.b + params.c)}
 a ${params.cornerRadius} ${params.cornerRadius} 0 0 1 ${params.arcSectionLength} -${params.arcSectionLength}
 c ${params.c} ${-params.d}
 ${params.b + params.c} ${-params.d}
 ${params.a + params.b + params.c} ${-params.d}`;
  }
  return rounded`l 0 ${-params.p}`;
};

const getSvgPathFromPathParams = ({
  width,
  height,
  topLeftPathParams,
  topRightPathParams,
  bottomLeftPathParams,
  bottomRightPathParams,
}: {
  width: number;
  height: number;
  topLeftPathParams: CornerPathParams;
  topRightPathParams: CornerPathParams;
  bottomLeftPathParams: CornerPathParams;
  bottomRightPathParams: CornerPathParams;
}) =>
  `
 M ${width - topRightPathParams.p} 0
 ${drawTopRightPath(topRightPathParams)}
 L ${width} ${height - bottomRightPathParams.p}
 ${drawBottomRightPath(bottomRightPathParams)}
 L ${bottomLeftPathParams.p} ${height}
 ${drawBottomLeftPath(bottomLeftPathParams)}
 L 0 ${topLeftPathParams.p}
 ${drawTopLeftPath(topLeftPathParams)}
 Z
 `
    .replace(/[\t\s\n]+/g, " ")
    .trim();

export const getSquircleSvgPath = ({
  cornerRadius = 0,
  topLeftCornerRadius,
  topRightCornerRadius,
  bottomRightCornerRadius,
  bottomLeftCornerRadius,
  cornerSmoothing = SQUIRCLE_CORNER_SMOOTHING,
  width,
  height,
  preserveSmoothing = false,
}: SquirclePathInput): string => {
  const resolvedTopLeft = topLeftCornerRadius ?? cornerRadius;
  const resolvedTopRight = topRightCornerRadius ?? cornerRadius;
  const resolvedBottomLeft = bottomLeftCornerRadius ?? cornerRadius;
  const resolvedBottomRight = bottomRightCornerRadius ?? cornerRadius;

  const isUniform =
    resolvedTopLeft === resolvedTopRight &&
    resolvedTopRight === resolvedBottomRight &&
    resolvedBottomRight === resolvedBottomLeft;

  if (isUniform) {
    const roundingAndSmoothingBudget = Math.min(width, height) / 2;
    const uniformRadius = Math.min(resolvedTopLeft, roundingAndSmoothingBudget);
    const pathParams = getPathParamsForCorner({
      cornerRadius: uniformRadius,
      cornerSmoothing,
      preserveSmoothing,
      roundingAndSmoothingBudget,
    });

    return getSvgPathFromPathParams({
      width,
      height,
      topLeftPathParams: pathParams,
      topRightPathParams: pathParams,
      bottomLeftPathParams: pathParams,
      bottomRightPathParams: pathParams,
    });
  }

  const { topLeft, topRight, bottomLeft, bottomRight } = distributeAndNormalize({
    topLeftCornerRadius: resolvedTopLeft,
    topRightCornerRadius: resolvedTopRight,
    bottomRightCornerRadius: resolvedBottomRight,
    bottomLeftCornerRadius: resolvedBottomLeft,
    width,
    height,
  });

  return getSvgPathFromPathParams({
    width,
    height,
    topLeftPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: topLeft.radius,
      roundingAndSmoothingBudget: topLeft.roundingAndSmoothingBudget,
    }),
    topRightPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: topRight.radius,
      roundingAndSmoothingBudget: topRight.roundingAndSmoothingBudget,
    }),
    bottomRightPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: bottomRight.radius,
      roundingAndSmoothingBudget: bottomRight.roundingAndSmoothingBudget,
    }),
    bottomLeftPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: bottomLeft.radius,
      roundingAndSmoothingBudget: bottomLeft.roundingAndSmoothingBudget,
    }),
  });
};
