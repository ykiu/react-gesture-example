import React, { useRef, useState, useLayoutEffect } from "react";
import CarouselItem from "./CarouselItem";

const urls = [
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/xjT82CBesKbu/d59618c2cb672295e0f5128f973eba7a.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/nz6yjgPCzOTn/e4ec350fdb527db8b2327b846557980b.JPG",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/JtCds0TxjDmo/d442e0a771e9ae3bf0abea6fac32aae5.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/c2EVvg4ZeFnt/74741ba4879bef80bb62b940d6d33e61.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/jCURAWhRo6zh/2a248cf665fc2d493ee966e39189c1a3.jpg"
];

function translateRefElement(ref, px, percent) {
  if (!ref.current) {
    return;
  }
  ref.current.style.transform = `translateX(calc(${px}px + ${percent}%))`;
}

export default function Carousel() {
  const [index, setIndex] = useState(1);
  const prev = useRef(null);
  const current = useRef(null);
  const next = useRef(null);
  function handleOffset(offsetTopLeft, offsetBottomRight) {
    if (offsetTopLeft[0] > 0) {
      translateRefElement(prev, offsetTopLeft[0] * 1.2, -100);
    }
    if (offsetBottomRight[0] < 0) {
      translateRefElement(next, offsetBottomRight[0] * 1.2, 100);
    }
  }

  function handleShift(v) {
    setIndex((currentIndex) => {
      if ((!prev.current && v < 0) || (!next.current && v > 0)) {
        return currentIndex;
      }
      return currentIndex + v;
    });
  }

  useLayoutEffect(() => {
    translateRefElement(prev, 0, -100);
    translateRefElement(current, 0, 0);
    translateRefElement(next, 0, 100);
  });

  return (
    <div className="carousel">
      {[null, ...urls, null].slice(index - 1, index + 2).map((url, i) => {
        return (
          url && (
            <CarouselItem
              key={url}
              ref={[prev, current, next][i]}
              url={url}
              onOffset={handleOffset}
              onShift={handleShift}
              className={i === 1 ? null : "image-prevnext"}
            />
          )
        );
      })}
    </div>
  );
}
