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

function deltaXY(xy1, xy2) {
  return [xy1[0] - xy2[0], xy1[1] - xy2[1]];
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
    originXY: null
  });
  function handleTouchMove(event) {
    event.preventDefault();
    const {
      current: { originXY, startMiddleXY, startDistance }
    } = touchState;
    if (event.touches.length < 2 || !startDistance) {
      return;
    }
    const currentXY1 = touchToXY(event.touches[0]);
    const currentXY2 = touchToXY(event.touches[1]);
    const currentDistance = distance(currentXY1, currentXY2);
    const scaleFactor = currentDistance / startDistance;
    const currentMiddleXY = middleXY(currentXY1, currentXY2);
    const transformOriginXY = deltaXY(currentMiddleXY, originXY);
    const translateXY = deltaXY(currentMiddleXY, startMiddleXY);
    event.target.style.transform = `scale(${scaleFactor}) translate(${translateXY[0]}px, ${translateXY[1]}px)`;
    event.target.style.transformOrigin = `${transformOriginXY[0]}px ${transformOriginXY[1]}px`;
  }

  function handleTouchStart(event) {
    if (event.touches.length >= 2) {
      const { current } = touchState;
      const startXY1 = touchToXY(event.touches[0]);
      const startXY2 = touchToXY(event.touches[1]);
      current.startXY1 = startXY1;
      current.startXY2 = startXY2;
      current.startMiddleXY = middleXY(startXY1, startXY2);
      current.startDistance = distance(startXY1, startXY2);
      const clientRect = event.target.getBoundingClientRect();
      current.originXY = [clientRect.x, clientRect.y];
    }
  }

  useLayoutEffect(() => {
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
