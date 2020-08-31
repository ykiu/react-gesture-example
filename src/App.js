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
  const touchState = useRef({
    startXY1: null,
    startXY2: null,
    startMiddleXY: null,
    startDistance: null,
    baseTranslateXY: [0, 0],
    nextBaseTranslateXY: [0, 0],
    baseScaleFactor: 1,
    nextBaseScaleFactor: 1,
    transformOriginXY: [0, 0],
    originXY: null
  });
  function handleTouchMove(event) {
    event.preventDefault();
    const { current } = touchState;
    const {
      originXY,
      startMiddleXY,
      startDistance,
      baseScaleFactor,
      baseTranslateXY
    } = current;
    if (event.touches.length < 2 || !startDistance) {
      return;
    }
    const currentXY1 = touchToXY(event.touches[0]);
    const currentXY2 = touchToXY(event.touches[1]);
    const currentDistance = distance(currentXY1, currentXY2);
    const scaleFactor = (baseScaleFactor * currentDistance) / startDistance;
    current.nextBaseScaleFactor = scaleFactor;
    const currentMiddleXY = middleXY(currentXY1, currentXY2);
    const transformOriginXY = divXY(
      subXY(startMiddleXY, originXY),
      baseScaleFactor
    );
    current.transformOriginXY = transformOriginXY;
    const translateXY = addXY(
      subXY(currentMiddleXY, startMiddleXY),
      baseTranslateXY
    );
    current.nextBaseTranslateXY = translateXY;
    event.target.style.transform = `translate(${translateXY[0]}px, ${translateXY[1]}px) scale(${scaleFactor})`;
    event.target.style.transformOrigin = `${transformOriginXY[0]}px ${transformOriginXY[1]}px`;
  }
  function handleTouchEnd(event) {}
  function handleTouchStart(event) {
    if (event.touches.length >= 2) {
      const { current } = touchState;
      current.baseScaleFactor = current.nextBaseScaleFactor;

      const startXY1 = touchToXY(event.touches[0]);
      const startXY2 = touchToXY(event.touches[1]);
      current.startXY1 = startXY1;
      current.startXY2 = startXY2;
      current.startMiddleXY = middleXY(startXY1, startXY2);
      current.startDistance = distance(startXY1, startXY2);
      const clientRect = event.target.getBoundingClientRect();
      current.originXY = [clientRect.x, clientRect.y];

      const transformOriginXY = divXY(
        subXY(current.startMiddleXY, current.originXY),
        current.nextBaseScaleFactor
      );

      const relativeOriginXY = subXY(current.originXY, [10, 10]); // FIXME
      const originXYWithoutTranslate = mulXY(
        transformOriginXY,
        1 - current.nextBaseScaleFactor
      );
      current.baseTranslateXY = subXY(
        relativeOriginXY,
        originXYWithoutTranslate
      );
    }
  }

  useLayoutEffect(() => {
    node.current.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    node.current.addEventListener("touchmove", handleTouchMove, {
      passive: false
    });
    node.current.addEventListener("touchend", handleTouchEnd, {
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
