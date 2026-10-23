"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, Check, CreditCard, ReceiptText, Zap } from "lucide-react";
import { LogoMark } from "./logo-mark";
import { useCopy } from "./language";

type Point = { x: number; y: number };
type Box = { left: number; right: number; top: number; bottom: number; x: number; y: number };
type Connection = { id: string; path: string };

function coordinates(points: Point[]) {
  return points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

export function ClarityNetwork() {
  const t = useCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const widgetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const filterId = useId();
  const [drawing, setDrawing] = useState({ width: 1000, height: 240, connections: [] as Connection[] });
  const widgets = [
    { id: "loan", Icon: CreditCard, label: t("Your loan", "სესხი") },
    { id: "bills", Icon: Zap, label: t("Utility bills", "ქვითრები") },
    { id: "taxes", Icon: ReceiptText, label: t("Taxes", "გადასახადები") },
    { id: "deadlines", Icon: Bell, label: t("Deadlines", "ვადები") },
  ];

  useEffect(() => {
    const root = rootRef.current;
    const picture = pictureRef.current;
    if (!root || !picture) return;
    let frame = 0;
    let active = true;

    function measure() {
      if (!active || !root || !picture) return;
      const bounds = root.getBoundingClientRect();
      const box = (element: HTMLElement): Box => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - bounds.left, right: rect.right - bounds.left,
          top: rect.top - bounds.top, bottom: rect.bottom - bounds.top,
          x: rect.left - bounds.left + rect.width / 2,
          y: rect.top - bounds.top + rect.height / 2,
        };
      };
      const hub = box(picture);
      const nodes = widgetRefs.current.filter((node): node is HTMLDivElement => node !== null).map(box);
      if (nodes.length !== 4) return;
      const mobile = window.matchMedia("(max-width: 640px)").matches;
      // On phones the clear channel between the cards carries the lines.
      const channel = (Math.max(nodes[0].right, nodes[2].right) + Math.min(nodes[1].left, nodes[3].left)) / 2;
      const connections = nodes.map((node, index) => {
        let points: Point[];
        if (mobile) {
          const left = index % 2 === 0;
          const lane = channel + (index - 1.5) * 2;
          const destination = hub.x + (index - 1.5) * 13;
          points = [
            { x: left ? node.right : node.left, y: node.y },
            { x: lane, y: node.y },
            { x: lane + (left ? 2 : -2), y: hub.top - 10 },
            { x: destination, y: hub.top - 5 },
            { x: destination, y: hub.top },
          ];
        } else if (node.top > hub.bottom && node.right > hub.left) {
          const gap = Math.min(10, (node.top - hub.bottom) / 3);
          const destination = Math.max(hub.left + 28, Math.min(hub.right - 28, node.x + 20));
          points = [
            { x: node.x, y: node.top },
            { x: node.x, y: node.top - gap },
            { x: destination - 12, y: hub.bottom + gap },
            { x: destination, y: hub.bottom + gap },
            { x: destination, y: hub.bottom },
          ];
        } else if (node.bottom < hub.top && node.right > hub.left) {
          points = [
            { x: node.right, y: node.y },
            { x: node.right + 14, y: node.y },
            { x: hub.x - 30, y: hub.top - 12 },
            { x: hub.x - 30, y: hub.top },
          ];
        } else {
          const destination = hub.top + (index === 0 ? 0.36 : index === 1 ? 0.72 : 0.2) * (hub.bottom - hub.top);
          points = [
            { x: node.right, y: node.y },
            { x: node.right + 22, y: node.y },
            { x: hub.left - 25, y: destination },
            { x: hub.left, y: destination },
          ];
        }
        return { id: ["loan", "bills", "taxes", "deadlines"][index], path: coordinates(points) };
      });
      const next = { width: bounds.width, height: bounds.height, connections };
      setDrawing(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    }

    const schedule = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    [root, picture, ...widgetRefs.current].forEach(node => { if (node) observer.observe(node); });
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="clarity-network" data-clarity-network role="group" aria-label={t("Your finances, connected", "შენი ფინანსები, ერთად")}>
      <svg className="network-connections" viewBox={`0 0 ${drawing.width} ${drawing.height}`} aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-30%" y="-100%" width="160%" height="300%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="2" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {drawing.connections.map((connection, index) => (
          <g key={connection.id} data-connection={connection.id}>
            <path className="network-line" d={connection.path} />
            <path className="network-line-glow" d={connection.path} filter={`url(#${filterId})`} />
            <path className="network-current" d={connection.path} pathLength={1} style={{ animationDelay: `${-index * 2}s` }} />
          </g>
        ))}
      </svg>
      {widgets.map(({ id, Icon, label }, index) => (
        <div
          key={id}
          ref={node => { widgetRefs.current[index] = node; }}
          className={`network-widget network-widget-${id}`}
          data-network-widget={id}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </div>
      ))}
      <div ref={pictureRef} className="clarity-destination network-picture" data-network-picture>
        <LogoMark className="brand-symbol" />
        <div>
          <strong>{t("One clear picture.", "ერთი ნათელი სურათი.")}</strong>
          <span>{t("A little more in control.", "ცოტა მეტი კონტროლი.")}</span>
        </div>
        <Check size={18} aria-hidden="true" />
      </div>
    </div>
  );
}
