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
  const makeMutateState = ({ touchStartState, touchMoveState }) => {
    const extraTouchStartState = { scalingOffsetRightBottom: [0, 0] };
    const extraTouchMoveState = {
      offsetTopLeft: [0, 0],
      offsetBottomRight: [0, 0]
    };
    function mutateTouchStartState() {
      const { scaleFactor, clientRect, transformOriginXY } = touchStartState;
      const { width, height } = clientRect;
      extraTouchStartState.scalingOffsetRightBottom = mulXY(
        subXY(divXY([width, height], scaleFactor), transformOriginXY),
        scaleFactor - 1
      );
    }
    function mutateTouchMoveState() {
      const { translateXY } = touchMoveState;
      const { scalingOffset } = touchStartState;
      const offsetTopLeft = addXY(translateXY, scalingOffset);
      const offsetBottomRight = addXY(
        translateXY,
        extraTouchStartState.scalingOffsetRightBottom
      );
      onOffset(offsetTopLeft, offsetBottomRight);
      extraTouchMoveState.offsetTopLeft = offsetTopLeft;
      extraTouchMoveState.offsetBottomRight = offsetBottomRight;
    }
    function onTouchEnd(event) {
      console.log("onTouchEnd");
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
    return { mutateTouchStartState, mutateTouchMoveState, onTouchEnd };
  };
  useTouchTransform(ref, { makeMutateState });
  return (
    <div
      className={["image", className].filter(Boolean).join(" ")}
      ref={ref}
      style={{ backgroundImage: `url(${url})` }}
    />
  );
});
