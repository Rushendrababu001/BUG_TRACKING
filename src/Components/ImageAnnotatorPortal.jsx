import React from "react";
import ReactDOM from "react-dom";

const ImageAnnotatorPortal = ({ children }) => {
  return ReactDOM.createPortal(
    children,
    document.getElementById("portal-root")
  );
};

export default ImageAnnotatorPortal;
