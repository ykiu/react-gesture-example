import React, { useRef, useLayoutEffect } from "react";
import "./styles.css";

const url =
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/xjT82CBesKbu/d59618c2cb672295e0f5128f973eba7a.jpg";

function touchToXY(touch) {
  return [touch.clientX, touch.clientY];
}

function getMiddleXY(xy1, xy2) {
  return [(xy1[0] + xy2[0]) / 2, (xy1[1] + xy2[1]) / 2];
}

function subXY(xy1, xy2) {
  return [xy1[0] - xy2[0], xy1[1] - xy2[1]];
}

function addXY(xy1, xy2) {
  return [xy1[0] + xy2[0], xy1[1] + xy2[1]];
}

function mulXY(xy, mul) {
  return [xy[0] * mul, xy[1] * mul];
}

function divXY(xy, divider) {
  return [xy[0] / divider, xy[1] / divider];
}

function getDistance(xy1, xy2) {
  return Math.sqrt((xy1[0] - xy2[0]) ** 2 + (xy1[1] - xy2[1]) ** 2);
}

export default function App() {
  const elementRef = useRef(null);
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
      translateXY: [0, 0],
      scaleFactor: 1,
      transformOriginXY: [0, 0]
    };

    // Values updated from the touch move handler
    const touchMoveState = {
      scaleFactor: 1,
      translateXY: null
    };
    // function handleTouchEnd(event) {
    //   event.preventDefault();
    //   if (!event.touches[0] || !event.changedTouches[0]) {
    //     return;
    //   }
    //   // Derive some basic metrics
    //   const xy1 = touchToXY(event.touches[0]);
    //   const xy2 = touchToXY(event.changedTouches[0]);
    //   const deltaMiddleXY = divXY(subXY(xy2, xy1), 2);
    //   console.log(deltaMiddleXY);
    //   touchStartState.middleXY = subXY(touchStartState.middleXY, deltaMiddleXY);
    // }

    function handleTouchMove(event) {
      event.preventDefault();
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
        distance > 0
          ? (startScaleFactor * distance) / startDistance
          : touchMoveState.scaleFactor;

      // Derive translate
      const translateXY = addXY(
        subXY(middleXY, startMiddleXY),
        touchStartState.translateXY
      );

      // Export work to the outside
      applyTransform(translateXY, scaleFactor);
      touchMoveState.scaleFactor = scaleFactor;
      touchMoveState.translateXY = translateXY;
    }
    function handleTouchStart(event) {
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
      const originXY = [clientRect.x, clientRect.y];

      // Derive transform origin
      const transformOriginXY = divXY(subXY(middleXY, originXY), scaleFactor);

      // Derive translate
      //   - prevPosition = newPosition
      //   - prevPosition = prevTranslateXY + prevScalingOffset
      //   - newPosition = newTranslateXY + newScalingOffset
      //   ∴ newTranslateXY = prevTranslateXY + prevScalingOffset - newScalingOffset
      const scalingOffset = mulXY(transformOriginXY, 1 - scaleFactor);
      const prevScalingOffset = mulXY(
        touchStartState.transformOriginXY,
        1 - scaleFactor
      );
      const prevTranslateXY =
        touchMoveState.translateXY || touchStartState.translateXY;
      const translateXY = subXY(
        addXY(prevTranslateXY, prevScalingOffset),
        scalingOffset
      );

      // Initialize touchMoveState
      touchMoveState.translateXY = null;

      // Export work to the outside
      touchStartState.scaleFactor = scaleFactor;
      touchStartState.middleXY = middleXY;
      touchStartState.distance = distance;
      touchStartState.translateXY = translateXY;
      touchStartState.transformOriginXY = transformOriginXY;
      applyTransform(translateXY, scaleFactor);
      applyTransformOrigin(transformOriginXY);
    }
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    element.addEventListener("touchstart", handleTouchMove, {
      passive: false
    });
    element.addEventListener("touchmove", handleTouchMove, {
      passive: false
    });
    element.addEventListener("touchend", handleTouchStart, {
      passive: false
    });
  });
  return (
    <div className="App">
      <div
        className="image"
        ref={elementRef}
        style={{ backgroundImage: `url(${url})` }}
      ></div>
    </div>
  );
}
