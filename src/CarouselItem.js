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
  { url, className, onOffset, onShift },
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
    function onTouchStart(event) {
      if (event.touches.length) {
        return;
      }

      const {
        offsetTopLeft,
        offsetBottomRight,
        timeStamp,
        prevTimeStamp,
        prevTranslateXY
      } = extraTouchMoveState;
      const { translateXY } = touchMoveState;
      const {
        clientRect: { width },
        scaleFactor
      } = touchStartState;

      const velocity =
        (translateXY[0] - prevTranslateXY[0]) / (timeStamp - prevTimeStamp);

      const thresholdWidth = (width / scaleFactor) * 0.5;

      if (
        offsetTopLeft[0] > thresholdWidth ||
        (offsetTopLeft[0] > 0 && velocity > VELOCITY_THRESHOLD)
      ) {
        onShift(-1);
      } else if (
        offsetBottomRight[0] < -thresholdWidth ||
        (offsetBottomRight[0] < 0 && velocity < -VELOCITY_THRESHOLD)
      ) {
        onShift(1);
      }
      return false;
    }
    function onTouchMove(event) {
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
    return { onTouchStart, onTouchMove };
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
