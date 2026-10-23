import { expect, test } from "@playwright/test";

test("the picture stays anchored and all four glowing widgets connect without overlap", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; } .clarity-diagram { opacity: 1 !important; transform: none !important; }" });
  await page.evaluate(() => document.fonts.ready);

  for (const width of [1440, 768, 641, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const language of ["en", "ka"]) {
      if (await page.locator("html").getAttribute("lang") !== language) await page.locator(".language-switch").click();
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await page.evaluate(() => document.fonts.ready);
      for (const theme of ["dark", "light"]) {
        if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator(".theme-toggle").click();
        await page.locator(".clarity-diagram").scrollIntoViewIfNeeded();
        await expect(page.locator("[data-network-widget]")).toHaveCount(4);
        await expect(page.locator("[data-connection]")).toHaveCount(4);
        await expect(page.locator("[data-network-picture]")).toBeVisible();
        await expect.poll(() => page.locator("[data-clarity-network]").evaluate(root => {
          const hub = root.querySelector<HTMLElement>("[data-network-picture]")!;
          const hubBox = hub.getBoundingClientRect();
          const diagramBox = root.parentElement!.getBoundingClientRect();
          const nodes = [...root.querySelectorAll<HTMLElement>("[data-network-widget]")];
          const boxes = [...nodes, hub].map(node => node.getBoundingClientRect());
          const overlap = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
          const onEdge = (point: DOMPoint, box: DOMRect) => {
            const inside = point.x >= box.left - 0.3 && point.x <= box.right + 0.3 && point.y >= box.top - 0.3 && point.y <= box.bottom + 0.3;
            return inside && Math.min(Math.abs(point.x - box.left), Math.abs(point.x - box.right), Math.abs(point.y - box.top), Math.abs(point.y - box.bottom)) < 0.3;
          };
          // A line may end at its own card, but must not run through another card.
          const crosses = (a: DOMPoint, b: DOMPoint, box: DOMRect) => {
            let lo = 0, hi = 1;
            const dx = b.x - a.x, dy = b.y - a.y;
            const p = [-dx, dx, -dy, dy];
            const q = [a.x - box.left - 1, box.right - a.x - 1, a.y - box.top - 1, box.bottom - a.y - 1];
            for (let i = 0; i < 4; i++) {
              if (!p[i] && q[i] < 0) return false;
              if (!p[i]) continue;
              const r = q[i] / p[i];
              if (p[i] < 0) lo = Math.max(lo, r); else hi = Math.min(hi, r);
              if (lo > hi) return false;
            }
            return true;
          };
          const connections = [...root.querySelectorAll<SVGGElement>("[data-connection]")];
          let connected = true, clearLines = true, mixedSegments = true;
          for (const connection of connections) {
            const path = connection.querySelector<SVGPathElement>("path")!;
            const matrix = path.getScreenCTM()!;
            const points = [...path.getAttribute("d")!.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(match => new DOMPoint(Number(match[1]), Number(match[2])).matrixTransform(matrix));
            const own = nodes.find(node => node.dataset.networkWidget === connection.dataset.connection)!;
            connected &&= onEdge(points[0], own.getBoundingClientRect()) && onEdge(points.at(-1)!, hubBox);
            mixedSegments &&= points.some((point, i) => i > 0 && Math.abs(point.y - points[i - 1].y) < 0.2 && Math.abs(point.x - points[i - 1].x) > 1)
              && points.some((point, i) => i > 0 && Math.abs(point.y - points[i - 1].y) > 1 && Math.abs(point.x - points[i - 1].x) > 1);
            for (const other of nodes.filter(node => node !== own)) {
              for (let i = 1; i < points.length; i++) if (crosses(points[i - 1], points[i], other.getBoundingClientRect())) clearLines = false;
            }
          }
          const mainAligned = innerWidth > 640
            ? Math.abs(hubBox.right - diagramBox.right) < 1 && Math.abs((hubBox.top + hubBox.bottom) / 2 - (diagramBox.top + diagramBox.bottom) / 2) < 1
            : Math.abs((hubBox.left + hubBox.right) / 2 - (diagramBox.left + diagramBox.right) / 2) < 1;
          return {
            noOverlap: boxes.every((box, i) => boxes.every((other, j) => i === j || !overlap(box, other))),
            fits: boxes.every(box => box.left >= -0.5 && box.right <= innerWidth + 0.5) && document.documentElement.scrollWidth <= innerWidth,
            readable: nodes.every(node => node.scrollWidth <= node.clientWidth + 1),
            mainAligned, connected, clearLines, mixedSegments,
          };
        }), { message: `${width}px / ${language} / ${theme}` }).toEqual({ noOverlap: true, fits: true, readable: true, mainAligned: true, connected: true, clearLines: true, mixedSegments: true });
      }
    }
  }

  const current = page.locator("[data-connection] path").last();
  if (testInfo.project.name.includes("reduced")) await expect(current).toHaveCSS("display", "none");
  else await expect(current).not.toHaveCSS("animation-name", "none");
});
