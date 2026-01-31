import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import ImageAnnotatorPortal from "./ImageAnnotatorPortal";


const ImageAnnotator = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const isMounted = useRef(true);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 550;

  // --------------------------
  // Save Canvas Snapshot
  // --------------------------
  const saveHistory = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toJSON());
    redoRef.current = [];
  };

  // --------------------------
  // Canvas Setup
  // --------------------------
useEffect(() => {
  isMounted.current = true;

  // SAFELY DISPOSE OLD CANVAS
  if (fabricRef.current) {
    try {
      fabricRef.current.dispose();
    } catch (e) {
      console.warn("dispose error:", e);
    }
    fabricRef.current = null;
  }

  // CREATE NEW CANVAS
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: "#fff",
  });
  fabricRef.current = canvas;

    canvas.on("path:created", () => {
    saveHistory();
  });

  let cancelled = false; // 🔥 Extra safety flag

  fabric.Image.fromURL(imageUrl, (img) => {

    // SAFETY CHECKS — Prevent ALL clearRect errors
    if (cancelled) return;
    if (!isMounted.current) return;
    if (!fabricRef.current) return;
    if (!canvas || !canvas.getContext || !canvas.contextContainer) return;

    const scale = Math.min(
      CANVAS_WIDTH / img.width,
      CANVAS_HEIGHT / img.height
    );

    img.scale(scale);

    img.set({
      left: CANVAS_WIDTH / 2 - (img.width * scale) / 2,
      top: CANVAS_HEIGHT / 2 - (img.height * scale) / 2,
    });

    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    saveHistory();
  });

  // CLEANUP — Runs when annotator closes OR drawer closes OR reopens
  return () => {
    cancelled = true;          // 🔥 stop async load callback
    isMounted.current = false;

    if (fabricRef.current) {
      try {
        fabricRef.current.dispose();
      } catch (e) {
        console.warn("dispose error:", e);
      }
      fabricRef.current = null;
    }
  };
}, [imageUrl]);


  // --------------------------
  // Tools
  // --------------------------

  const enableDraw = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "red";
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const text = new fabric.Textbox("Text", {
      left: 100,
      top: 100,
      fontSize: 26,
      fill: "#0066ff",
      fontWeight: "bold",
    });

    canvas.add(text);
    saveHistory();
  };

  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (historyRef.current.length > 1) {
      redoRef.current.push(historyRef.current.pop());
      const prev = historyRef.current[historyRef.current.length - 1];
      canvas.loadFromJSON(prev, () => canvas.renderAll());
    }
  };

  const redo = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (redoRef.current.length > 0) {
      const next = redoRef.current.pop();
      historyRef.current.push(next);
      canvas.loadFromJSON(next, () => canvas.renderAll());
    }
  };

  const saveImage = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({ format: "png" });
    onSave(dataURL);
  };

  // --------------------------
  // UI
  // --------------------------

  return (
  <ImageAnnotatorPortal>
    {/* Fullscreen overlay */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center"
      style={{ zIndex: 9999999 }}
    >
      {/* White box modal */}
      <div className="bg-white rounded-lg shadow-xl p-5 relative w-[950px]">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600 text-3xl font-bold hover:text-red-700"
        >
          ✕
        </button>

        {/* Toolbar */}
        <div className="flex gap-4 mb-4 text-2xl">

          <button
            onClick={enableDraw}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            title="Draw"
          >
            ✏️
          </button>

          <button
            onClick={addText}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            title="Text"
          >
            🅰️
          </button>

          <button
            onClick={undo}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            title="Undo"
          >
            ↩️
          </button>

          <button
            onClick={redo}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            title="Redo"
          >
            ↪️
          </button>

          <button
            onClick={saveImage}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            title="Save"
          >
            💾
          </button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border rounded-lg shadow-md mx-auto"
        />
      </div>
    </div>
  </ImageAnnotatorPortal>
);
};

export default ImageAnnotator;
