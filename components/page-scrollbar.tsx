"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export function PageScrollbar() {
  const track = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<number | null>(null);
  const [metrics, setMetrics] = useState({ height: 48, top: 0, progress: 0, visible: false });

  useEffect(() => {
    const root = document.documentElement;
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const highContrast = window.matchMedia("(forced-colors: active)");
    let frame = 0;
    const measure = () => {
      const maxScroll = root.scrollHeight - window.innerHeight;
      const enabled = desktop.matches && !highContrast.matches;
      root.toggleAttribute("data-custom-scrollbar", enabled);
      const trackHeight = track.current?.clientHeight ?? 0;
      const height = Math.min(trackHeight, Math.max(48, trackHeight * window.innerHeight / root.scrollHeight));
      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
      const next = { height, top: progress * (trackHeight - height), progress, visible: enabled && maxScroll > 0 };
      setMetrics(previous => Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    observer.observe(root);
    if (track.current) observer.observe(track.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    highContrast.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      highContrast.removeEventListener("change", schedule);
      root.removeAttribute("data-custom-scrollbar");
    };
  }, []);

  const moveTo = (clientY: number) => {
    const element = track.current;
    if (!element) return;
    const travel = element.clientHeight - metrics.height;
    if (travel <= 0) return;
    const progress = Math.max(0, Math.min(1, (clientY - element.getBoundingClientRect().top - (dragOffset.current ?? metrics.height / 2)) / travel));
    window.scrollTo({ top: progress * (document.documentElement.scrollHeight - window.innerHeight), behavior: "instant" });
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    dragOffset.current = event.target === event.currentTarget ? metrics.height / 2 : event.clientY - event.currentTarget.getBoundingClientRect().top - metrics.top;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "true";
    moveTo(event.clientY);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragOffset.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const destinations: Record<string, number> = {
      ArrowDown: window.scrollY + 40, ArrowUp: window.scrollY - 40,
      PageDown: window.scrollY + window.innerHeight * 0.9, PageUp: window.scrollY - window.innerHeight * 0.9,
      Home: 0, End: max,
      " ": window.scrollY + window.innerHeight * 0.9 * (event.shiftKey ? -1 : 1),
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    window.scrollTo({ top: Math.max(0, Math.min(max, destinations[event.key])), behavior: "instant" });
  };

  return (
    <div ref={track} className="page-scrollbar" data-visible={metrics.visible}
      role="scrollbar" aria-label="Page scroll" aria-controls="main" aria-orientation="vertical"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(metrics.progress * 100)}
      tabIndex={metrics.visible ? 0 : -1} aria-hidden={!metrics.visible}
      onPointerDown={startDrag} onPointerMove={event => { if (dragOffset.current !== null) moveTo(event.clientY); }}
      onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={onKeyDown}>
      <span className="page-scrollbar-thumb" style={{ height: metrics.height, transform: `translateY(${metrics.top}px)` }} />
    </div>
  );
}
