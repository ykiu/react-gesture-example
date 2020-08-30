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

function eventToDistance(event) {
  if (event.touches.length < 2) {
    return null;
  }
  return distance(...[...event.touches].map(touchToXY));
}

export default function App() {
  const node = useRef(null);
  const touchState = useRef({
    startXY1: null,
    startXY2: null,
    distance: null,
    elementOriginXY: null
  });
  function handletouch(event) {
    event.preventDefault();
    const { current } = touchState;
    const startDistance = current.distance;
    const currentDistance = eventToDistance(event);
    if (!startDistance || !currentDistance) {
      return;
    }
    const scaleFactor = currentDistance / startDistance;
    // const transformOriginXY = deltaXY(
    //   touchToXY(event.touches[0]),
    //   current.elementOriginXY
    // );
    const transformOriginXY = middleXY(
      deltaXY(touchToXY(event.touches[0]), current.elementOriginXY),
      deltaXY(touchToXY(event.touches[1]), current.elementOriginXY)
    );
    const translateXY = middleXY(
      deltaXY(touchToXY(event.touches[0]), current.startXY1),
      deltaXY(touchToXY(event.touches[1]), current.startXY2)
    );
    //  middleXY(
    //   touchToXY(event.touches[0]),
    //   touchToXY(event.touches[1])
    // );
    event.target.style.transform = `scale(${scaleFactor}) translate(${translateXY[0]}px, ${translateXY[1]}px)`;
    // event.target.style.transformOrigin = "0 0";
    event.target.style.transformOrigin = `${transformOriginXY[0]}px ${transformOriginXY[1]}px`;
  }

  function handleTouchStart(event) {
    if (event.touches.length >= 2) {
      const { current } = touchState;
      current.startXY1 = touchToXY(event.touches[0]);
      current.startXY2 = touchToXY(event.touches[1]);
      current.distance = eventToDistance(event);
      const clientRect = event.target.getBoundingClientRect();
      current.elementOriginXY = [clientRect.x, clientRect.y];
      console.log(current.elementOriginXY);
    }
  }

  useLayoutEffect(() => {
    node.current.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    node.current.addEventListener("touchmove", handletouch, { passive: false });
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
