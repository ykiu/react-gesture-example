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
      transformOriginXY: null,
      originXY: null
    };

    // Values updated from the touch move handler
    const touchMoveState = {
      scaleFactor: 1
    };

    function handleTouchMove(event) {
      event.preventDefault();
      const startDistance = touchStartState.distance;
      if (event.touches.length < 2 || !startDistance) {
        return;
      }
      const startMiddleXY = touchStartState.middleXY;
      const startScaleFactor = touchStartState.scaleFactor;

      // Derive some basic metrics
      const xy1 = touchToXY(event.touches[0]);
      const xy2 = touchToXY(event.touches[1]);

      // Derive scale factor
      const distance = getDistance(xy1, xy2);
      const scaleFactor = (startScaleFactor * distance) / startDistance;

      // Derive translate
      const middleXY = getMiddleXY(xy1, xy2);
      const translateXY = addXY(
        subXY(middleXY, startMiddleXY),
        touchStartState.translateXY
      );

      // Export work to the outside
      applyTransform(translateXY, scaleFactor);
      touchMoveState.scaleFactor = scaleFactor;
    }
    function handleTouchStart(event) {
      if (event.touches.length < 2) {
        return;
      }
      const { scaleFactor } = touchMoveState;

      // Derive some basic metrics
      const xy1 = touchToXY(event.touches[0]);
      const xy2 = touchToXY(event.touches[1]);

      // Derive distance
      const distance = getDistance(xy1, xy2);

      // Derive target element position relative to the view port
      const clientRect = event.target.getBoundingClientRect();
      const originXY = [clientRect.x, clientRect.y];

      // Derive transform origin
      const middleXY = getMiddleXY(xy1, xy2);
      const transformOriginXY = divXY(subXY(middleXY, originXY), scaleFactor);

      // Derive translate
      const originXYWithoutTranslate = mulXY(
        transformOriginXY,
        1 - scaleFactor
      ); // Where the target element would be were it not for translate(...)
      const relativeOriginXY = subXY(originXY, [10, 10]); // FIXME
      const translateXY = subXY(relativeOriginXY, originXYWithoutTranslate);

      // Export work to the outside
      touchStartState.scaleFactor = scaleFactor;
      touchStartState.middleXY = middleXY;
      touchStartState.distance = distance;
      touchStartState.originXY = originXY;
      touchStartState.translateXY = translateXY;
      applyTransform(translateXY, scaleFactor);
      applyTransformOrigin(transformOriginXY);
    }
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    element.addEventListener("touchmove", handleTouchMove, {
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
