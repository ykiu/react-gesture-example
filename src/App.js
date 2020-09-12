import React, { useState, useRef } from "react";
import "./styles.css";
import Carousel from "./Carousel";
import TouchMarker from "./TouchMarker";

export default function App() {
  const carouselContainer = useRef();
  const [key, setKey] = useState(false);
  const [touchMarkersShown, setTouchMarkersShown] = useState(false);
  return (
    <div className="app">
      <h1 className="title">⚛️ React Carousel</h1>
      <div ref={carouselContainer}>
        <Carousel key={key} />
      </div>
      <div className="form-item">
        <label htmlFor="app__toggle-marker">Show touch markers</label>
        <input
          type="checkbox"
          className="toggle app__toggle-marker"
          id="app__toggle-marker"
          onChange={(e) => setTouchMarkersShown(e.target.checked)}
        />
      </div>
      <button
        onClick={() => setKey((key) => !key)}
        className="btn app__reset-btn"
      >
        RESET
      </button>
      {touchMarkersShown && (
        <>
          <TouchMarker
            identifier={0}
            targetRef={carouselContainer}
            className="app__touch-marker"
          />
          <TouchMarker
            identifier={1}
            targetRef={carouselContainer}
            className="app__touch-marker"
          />
        </>
      )}
    </div>
  );
}
