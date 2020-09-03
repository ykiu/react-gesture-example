import React, { useRef, useLayoutEffect } from "react";

function getTouchByIdentifier(touches, identifier) {
  return [...touches].find((t) => t.identifier === identifier);
}

export default function TouchMarker({ identifier }) {
  const ref = useRef();
  useLayoutEffect(() => {
    function handleTouchStart(event) {
      const touch = getTouchByIdentifier(event.touches, identifier);
      if (!touch) {
        return;
      }
      ref.current.style.opacity = 1;
    }
    function handleTouchMove(event) {
      const touch = getTouchByIdentifier(event.touches, identifier);
      if (!touch) {
        return;
      }
      const { pageX, pageY } = touch;
      ref.current.style.left = `${pageX}px`;
      ref.current.style.top = `${pageY}px`;
    }
    function handleTouchEnd(event) {
      const touch = getTouchByIdentifier(event.changedTouches, identifier);
      if (!touch) {
        return;
      }
      ref.current.style.opacity = null;
    }
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchstart", handleTouchMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  });
  return <div className="touch-marker" ref={ref} />;
}
