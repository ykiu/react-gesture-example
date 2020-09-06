import { useLayoutEffect } from "react";

function touchToXY(touch) {
  return [touch.clientX, touch.clientY];
}

function getMiddleXY(xy1, xy2) {
  return [(xy1[0] + xy2[0]) / 2, (xy1[1] + xy2[1]) / 2];
}

export function subXY(xy1, xy2) {
  return [xy1[0] - xy2[0], xy1[1] - xy2[1]];
}

export function addXY(xy1, xy2) {
  return [xy1[0] + xy2[0], xy1[1] + xy2[1]];
}

export function mulXY(xy, mul) {
  return [xy[0] * mul, xy[1] * mul];
}

export function divXY(xy, divider) {
  return [xy[0] / divider, xy[1] / divider];
}

function getDistance(xy1, xy2) {
  return Math.sqrt((xy1[0] - xy2[0]) ** 2 + (xy1[1] - xy2[1]) ** 2);
}

function preventDefault(event) {
  if (event.cancelable) {
    event.preventDefault();
  }
}

const mutateStateDefault = {
  mutateTouchStartState() {},
  mutateTouchMoveState() {}
};

export default function useTouchTransform(
  elementRef,
  { makeMutateState = () => mutateStateDefault } = {}
) {
  useLayoutEffect(() => {
    const element = elementRef.current;
    function applyTransform(translateXY, scaleFactor) {
      element.style.transform = `translate(${translateXY[0]}px, ${translateXY[1]}px) scale(${scaleFactor})`;
    }
    function applyTransformOrigin(transformOriginXY) {
      element.style.transformOrigin = `${transformOriginXY[0]}px ${transformOriginXY[1]}px`;
    }
    // Values updated from the touch start handler
    const touchStartState = {
      middleXY: null,
      distance: null,
      clientRect: null,
      translateXY: [0, 0],
      scaleFactor: 1,
      scalingOffset: [0, 0],
      transformOriginXY: [0, 0]
    };

    // Values updated from the touch move handler
    const touchMoveState = {
      scaleFactor: 1,
      translateXY: [0, 0]
    };

    const {
      mutateTouchStartState,
      mutateTouchMoveState,
      onTouchEnd
    } = makeMutateState({
      touchStartState,
      touchMoveState
    });

    function handleTouchMove(event) {
      preventDefault(event);
      const startDistance = touchStartState.distance;
      const startMiddleXY = touchStartState.middleXY;
      const startScaleFactor = touchStartState.scaleFactor;

      // Derive some basic metrics
      const xy1 = touchToXY(event.touches[0]);
      const xy2 = touchToXY(event.touches[1] || event.touches[0]);
      const middleXY = getMiddleXY(xy1, xy2);

      // Derive scale factor
      const distance = getDistance(xy1, xy2);
      const scaleFactor =
        startDistance > 0
          ? (startScaleFactor * distance) / startDistance
          : touchMoveState.scaleFactor;

      // Derive translate
      const translateXY = addXY(
        subXY(middleXY, startMiddleXY),
        touchStartState.translateXY
      );

      // Export work to the outside
      touchMoveState.scaleFactor = scaleFactor;
      touchMoveState.translateXY = translateXY;
      mutateTouchMoveState();
      applyTransform(touchMoveState.translateXY, touchMoveState.scaleFactor);
    }
    function handleTouchStart(event) {
      preventDefault(event);
      if (!event.touches.length) {
        return;
      }
      const { scaleFactor } = touchMoveState;

      // Derive some basic metrics
      const xy1 = touchToXY(event.touches[0]);
      const xy2 = touchToXY(event.touches[1] || event.touches[0]);
      const middleXY = getMiddleXY(xy1, xy2);

      // Derive distance
      const distance = getDistance(xy1, xy2);

      // Derive target element position relative to the view port
      const clientRect = event.target.getBoundingClientRect();
      const positionXY = [clientRect.x, clientRect.y];

      // Derive transform origin
      const transformOriginXY = divXY(subXY(middleXY, positionXY), scaleFactor);

      // Derive translate
      //   prevPosition = newPosition
      //   prevPosition = prevTranslateXY + prevScalingOffset
      //   newPosition = newTranslateXY + newScalingOffset
      //   ∴ newTranslateXY = prevTranslateXY + prevScalingOffset - newScalingOffset
      const scalingOffset = mulXY(transformOriginXY, 1 - scaleFactor);
      const prevScalingOffset = mulXY(
        touchStartState.transformOriginXY,
        1 - scaleFactor
      );
      const prevTranslateXY = touchMoveState.translateXY;
      const translateXY = subXY(
        addXY(prevTranslateXY, prevScalingOffset),
        scalingOffset
      );

      // Export work to the outside
      touchStartState.scaleFactor = scaleFactor;
      touchStartState.scalingOffset = scalingOffset;
      touchStartState.middleXY = middleXY;
      touchStartState.distance = distance;
      touchStartState.clientRect = clientRect;
      touchStartState.translateXY = translateXY;
      touchStartState.transformOriginXY = transformOriginXY;
      mutateTouchStartState();
      touchMoveState.translateXY = translateXY;
      applyTransform(touchStartState.translateXY, touchStartState.scaleFactor);
      applyTransformOrigin(touchStartState.transformOriginXY);
    }
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    element.addEventListener("touchmove", handleTouchMove, {
      passive: false
    });
    element.addEventListener("touchend", handleTouchStart, {
      passive: false
    });
    element.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
    };
  }, [elementRef, makeMutateState]);
}
