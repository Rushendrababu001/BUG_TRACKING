import React from "react";
import { ShineBorder } from "./ShineBorder"; 

export default function GlowBorder({
  children,
  colors = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  borderWidth = 2,
  radius = 20,
  className = "",
}) {
  return (
    <div
      className={`relative block rounded-[${radius}px] ${className}`}
      style={{ borderRadius: radius }}
    >
      <ShineBorder
        shineColor={colors}
        borderWidth={borderWidth}
        style={{ borderRadius: radius }}
      />

      <div className="bg-background rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}
