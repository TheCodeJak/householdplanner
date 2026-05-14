"use client";

import { useEffect, useRef, useState } from "react";

type ModalProps = {
  onClose: () => void;
  children: (close: () => void) => React.ReactNode;
  size?: "small" | "standard" | "large";
};

const sizeClasses = {
  small: "max-w-sm",
  standard: "max-w-xl",
  large: "max-w-3xl",
};

export default function Modal({
  onClose,
  children,
  size = "standard",
}: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragOffset(Math.max(0, e.clientY - startY.current));
  };

  const onPointerUp = () => {
    setDragging(false);
    if (dragOffset > 110) close();
    else setDragOffset(0);
  };

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      <div
        style={{
          transform: visible
            ? `translateY(${dragOffset}px)`
            : "translateY(100%)",
        }}
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto ${sizeClasses[size]} rounded-t-3xl bg-white shadow-2xl ${dragging ? "" : "transition-transform duration-300 ease-out"}`}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex touch-none select-none justify-center pb-2 pt-3 cursor-grab active:cursor-grabbing"
        >
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        <div className="max-h-[78vh] overflow-y-auto overscroll-contain px-6 pb-10 pt-2">
          {children(close)}
        </div>
      </div>
    </>
  );
}
