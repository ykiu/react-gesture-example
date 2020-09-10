import React from "react";
import "./styles.css";
import useTouchTransform, {
  mulXY,
  divXY,
  subXY,
  addXY
} from "./hooks/useTouchTransform";

const VELOCITY_THRESHOLD = 0.5;

export default React.forwardRef(function CarouselItem(
  {
    url,
    className,
    onOffset,
    onLeft,
    onRight,
    onScaleSnap,
    onXYSnap,
    onTouchStart
  },
  ref
) {
  const makeHandlers = ({ touchStartState, touchMoveState }) => {
    const extraTouchMoveState = {
      offsetTopLeft: [0, 0],
      offsetBottomRight: [0, 0],

      // Hysteresis values
      timeStamp: null,
      prevTimeStamp: null,
      prevTranslateXY: [0, 0]
    };

    function handleTouchStart(event) {
      if (onTouchStart(event) === false || event.touches.length) {
        return;
      }

      const {
        offsetTopLeft,
        offsetBottomRight,
        timeStamp,
        prevTimeStamp,
        prevTranslateXY
      } = extraTouchMoveState;
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        clientRect: { width },
        scaleFactor: startScaleFactor
      } = touchStartState;

      if (scaleFactor < 1) {
        touchStartState.scaleFactor = 1;
        touchMoveState.scaleFactor = 1;
        touchStartState.translateXY = [0, 0];
        touchMoveState.translateXY = [0, 0];
        onScaleSnap();
        return;
      }

      const velocity =
        (translateXY[0] - prevTranslateXY[0]) / (timeStamp - prevTimeStamp);
      const thresholdWidth = (width / startScaleFactor) * 0.5;

      if (
        onLeft &&
        (offsetTopLeft[0] > thresholdWidth ||
          (offsetTopLeft[0] > 0 && velocity > VELOCITY_THRESHOLD))
      ) {
        onLeft();
        return false;
      }
      if (
        onRight &&
        (offsetBottomRight[0] < -thresholdWidth ||
          (offsetBottomRight[0] < 0 && velocity < -VELOCITY_THRESHOLD))
      ) {
        onRight();
        return false;
      }
      let xySnapped = false;
      if (offsetTopLeft[0] > 0) {
        xySnapped = true;
        touchStartState.translateXY[0] -= offsetTopLeft[0];
      }
      if (offsetTopLeft[1] > 0) {
        xySnapped = true;
        touchStartState.translateXY[1] -= offsetTopLeft[1];
      }
      if (offsetBottomRight[0] < 0) {
        xySnapped = true;
        touchStartState.translateXY[0] -= offsetBottomRight[0];
      }
      if (offsetBottomRight[1] < 0) {
        xySnapped = true;
        touchStartState.translateXY[1] -= offsetBottomRight[1];
      }
      if (xySnapped) {
        onXYSnap();
      }
    }
    function handleTouchMove(event) {
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        transformOriginXY,
        scaleFactor: startScaleFactor,
        clientRect: { width, height }
      } = touchStartState;
      const {
        timeStamp: prevTimeStamp,
        translateXY: prevTranslateXY
      } = extraTouchMoveState;
      const { timeStamp } = event;

      // Derive scaling offset for each corner
      const scalingOffsetTopLeft = mulXY(transformOriginXY, 1 - scaleFactor);
      const scalingOffsetBottomRight = mulXY(
        subXY(divXY([width, height], startScaleFactor), transformOriginXY),
        scaleFactor - 1
      );

      // Derive offset including translation for each corner
      const offsetTopLeft = addXY(translateXY, scalingOffsetTopLeft);
      const offsetBottomRight = addXY(translateXY, scalingOffsetBottomRight);

      onOffset(offsetTopLeft, offsetBottomRight);
      extraTouchMoveState.offsetTopLeft = offsetTopLeft;
      extraTouchMoveState.offsetBottomRight = offsetBottomRight;
      extraTouchMoveState.timeStamp = timeStamp;
      extraTouchMoveState.prevTimeStamp = prevTimeStamp;
      extraTouchMoveState.translateXY = translateXY;
      extraTouchMoveState.prevTranslateXY = prevTranslateXY;
    }
    return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove };
  };
  useTouchTransform(ref, { makeHandlers });
  return (
    <div
      className={["image", className].filter(Boolean).join(" ")}
      ref={ref}
      style={{ backgroundImage: `url(${url})` }}
    />
  );
});
