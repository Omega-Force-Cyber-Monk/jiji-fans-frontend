import React from "react";

interface SlideProps {
  visible: boolean;
  direction?: "up" | "down";
  children: React.ReactNode;
}

/**
 * CSS-only slide + fade transition wrapper.
 * Hides content with opacity/transform without unmounting it.
 * Use conditional rendering inside for components that use hooks (e.g. SuccessView).
 */
const Slide = ({ visible, direction = "up", children }: SlideProps) => (
  <div
    className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
    style={{
      opacity: visible ? 1 : 0,
      transform: visible
        ? "translateY(0)"
        : direction === "up"
          ? "translateY(-28px)"
          : "translateY(28px)",
      pointerEvents: visible ? "auto" : "none",
    }}
  >
    {children}
  </div>
);

export default Slide;
