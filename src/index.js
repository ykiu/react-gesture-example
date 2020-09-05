import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
// import TouchMarker from "./TouchMarker";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
    {/* <TouchMarker identifier={0} />
    <TouchMarker identifier={1} /> */}
  </React.StrictMode>,
  rootElement
);
