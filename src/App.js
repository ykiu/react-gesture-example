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
      <div className="appbar">
        <h1 className="appbar__title">⚛️ React Carousel</h1>
        <div className="appbar__spacer" />
        <button
          onClick={() => setKey((key) => !key)}
          className="btn app__reset-btn"
        >
          ↺ RELOAD
        </button>
      </div>
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
