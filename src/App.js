import React, { useRef, useLayoutEffect } from "react";
import "./styles.css";

const url =
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/xjT82CBesKbu/d59618c2cb672295e0f5128f973eba7a.jpg";

function touchToXY(touch) {
  return [touch.clientX, touch.clientY];
}

function middleXY(xy1, xy2) {
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

function distance(xy1, xy2) {
  return Math.sqrt((xy1[0] - xy2[0]) ** 2 + (xy1[1] - xy2[1]) ** 2);
}

export default function App() {
  const node = useRef(null);
  useLayoutEffect(() => {
    // Values updated from the touch start handler
    const touchStartState = {
      middleXY: null,
      distance: null,
      translateXY: [0, 0],
      scaleFactor: 1,
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
      const currentXY1 = touchToXY(event.touches[0]);
      const currentXY2 = touchToXY(event.touches[1]);
      const currentDistance = distance(currentXY1, currentXY2);
      const scaleFactor = (startScaleFactor * currentDistance) / startDistance;
      touchMoveState.scaleFactor = scaleFactor;
      const currentMiddleXY = middleXY(currentXY1, currentXY2);
      const transformOriginXY = divXY(
        subXY(startMiddleXY, touchStartState.originXY),
        startScaleFactor
      );
      const translateXY = addXY(
        subXY(currentMiddleXY, startMiddleXY),
        touchStartState.translateXY
      );
      event.target.style.transform = `translate(${translateXY[0]}px, ${translateXY[1]}px) scale(${scaleFactor})`;
      event.target.style.transformOrigin = `${transformOriginXY[0]}px ${transformOriginXY[1]}px`;
    }
    function handleTouchStart(event) {
      if (event.touches.length < 2) {
        return;
      }
      const { scaleFactor } = touchMoveState;
      touchStartState.scaleFactor = scaleFactor;

      const startXY1 = touchToXY(event.touches[0]);
      const startXY2 = touchToXY(event.touches[1]);
      touchStartState.middleXY = middleXY(startXY1, startXY2);
      touchStartState.distance = distance(startXY1, startXY2);
      const clientRect = event.target.getBoundingClientRect();
      const originXY = [clientRect.x, clientRect.y];
      touchStartState.originXY = originXY;

      const transformOriginXY = divXY(
        subXY(touchStartState.middleXY, originXY),
        scaleFactor
      );

      const relativeOriginXY = subXY(originXY, [10, 10]); // FIXME
      const originXYWithoutTranslate = mulXY(
        transformOriginXY,
        1 - scaleFactor
      );
      touchStartState.translateXY = subXY(
        relativeOriginXY,
        originXYWithoutTranslate
      );
    }
    console.log("foo");
    node.current.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    node.current.addEventListener("touchmove", handleTouchMove, {
      passive: false
    });
  });
  return (
    <div className="App">
      <div
        className="image"
        ref={node}
        style={{ backgroundImage: `url(${url})` }}
      ></div>
    </div>
  );
}
