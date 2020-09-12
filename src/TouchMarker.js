import React, { useRef, useLayoutEffect } from "react";

function getTouchByIdentifier(touches, identifier) {
  return [...touches].find((t) => t.identifier === identifier);
}

export default function TouchMarker({ identifier, targetRef, className }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const target = targetRef ? targetRef.current : window;
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
    target.addEventListener("touchstart", handleTouchStart);
    target.addEventListener("touchstart", handleTouchMove);
    target.addEventListener("touchmove", handleTouchMove);
    target.addEventListener("touchend", handleTouchEnd);
    return () => {
      target.removeEventListener("touchstart", handleTouchStart);
      target.removeEventListener("touchstart", handleTouchMove);
      target.removeEventListener("touchmove", handleTouchMove);
      target.removeEventListener("touchend", handleTouchEnd);
    };
  });
  return (
    <div
      className={["touch-marker", className].filter(Boolean).join(" ")}
      ref={ref}
    />
  );
}
