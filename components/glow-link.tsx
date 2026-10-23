"use client";

import type {
  ComponentProps,
  CSSProperties,
  FocusEvent,
  PointerEvent,
} from "react";

const glassStyle: CSSProperties = {
  backdropFilter: "blur(16px) saturate(150%)",
  WebkitBackdropFilter: "blur(16px) saturate(150%)",
};

function trackGlow(event: PointerEvent<HTMLElement>) {
  if (
    event.pointerType === "touch" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    "--glow-x",
    `${event.clientX - bounds.left}px`,
  );
  event.currentTarget.style.setProperty(
    "--glow-y",
    `${event.clientY - bounds.top}px`,
  );
}

function centerGlow(event: FocusEvent<HTMLElement>) {
  // Pointer clicks also focus the control. Keep the pointer's coordinates
  // instead of resetting a hovered glow when that focus event fires.
  if (event.currentTarget.matches(":hover")) return;
  event.currentTarget.style.setProperty("--glow-x", "50%");
  event.currentTarget.style.setProperty("--glow-y", "50%");
}

export function GlowLink({
  className = "",
  children,
  style,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className={`glow-control glow-link ${className}`}
      style={{ ...glassStyle, ...style }}
      onPointerMove={trackGlow}
      onPointerDown={trackGlow}
      onFocus={centerGlow}
    >
      {children}
    </a>
  );
}

export function GlowButton({
  className = "",
  children,
  style,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`glow-control glow-button ${className}`}
      style={{ ...glassStyle, ...style }}
      onPointerMove={trackGlow}
      onPointerDown={trackGlow}
      onFocus={centerGlow}
    >
      {children}
    </button>
  );
}
