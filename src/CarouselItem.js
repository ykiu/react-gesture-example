import React from "react";
import "./styles.css";
import useTouchTransform, {
  mulXY,
  divXY,
  subXY,
  addXY
} from "./hooks/useTouchTransform";

export default React.forwardRef(function CarouselItem(
  { url, className, onOffset, onShift },
  ref
) {
  const makeHandlers = ({ touchStartState, touchMoveState }) => {
    const extraTouchMoveState = {
      offsetTopLeft: [0, 0],
      offsetBottomRight: [0, 0]
    };
    function onTouchMove() {
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        transformOriginXY,
        scaleFactor: startScaleFactor,
        clientRect: { width, height }
      } = touchStartState;

      const scalingOffsetTopLeft = mulXY(transformOriginXY, 1 - scaleFactor);
      const scalingOffsetBottomRight = mulXY(
        subXY(divXY([width, height], startScaleFactor), transformOriginXY),
        scaleFactor - 1
      );

      const offsetTopLeft = addXY(translateXY, scalingOffsetTopLeft);
      const offsetBottomRight = addXY(translateXY, scalingOffsetBottomRight);
      onOffset(offsetTopLeft, offsetBottomRight);
      extraTouchMoveState.offsetTopLeft = offsetTopLeft;
      extraTouchMoveState.offsetBottomRight = offsetBottomRight;
    }
    function onTouchEnd(event) {
      if (event.touches.length) {
        return;
      }
      const { offsetTopLeft, offsetBottomRight } = extraTouchMoveState;
      if (offsetTopLeft[0] > 0) {
        onShift(-1);
      } else if (offsetBottomRight[0] < 0) {
        onShift(1);
      }
    }
    return { onTouchMove, onTouchEnd };
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
