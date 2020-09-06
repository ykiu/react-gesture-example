import React, { useState } from "react";
import "./styles.css";
import Carousel from "./Carousel";

export default function App() {
  const [key, setKey] = useState(false);
  return (
    <div>
      <button onClick={() => setKey((key) => !key)}>RESET</button>
      <Carousel key={key} />
    </div>
  );
}
