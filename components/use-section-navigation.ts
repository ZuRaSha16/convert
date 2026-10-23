"use client";

import { useEffect } from "react";
import { motionEasing, motionTiming, staggerContent, stopEntryMotion } from "./motion-style";

export function useSectionNavigation() {
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("main > section[id]")];
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const sectionForHash = (hash: string) => {
      const id = hash.slice(1) || "home";
      return sections.find(section => section.id === id);
    };

    const revealSection = (section: HTMLElement, direction: number) => {
      // Cancel only our entrance effects; the phone and ambient loops continue.
      sections.forEach(stopEntryMotion);
      section.dataset.motionDirection = String(direction);
      if (media.matches) return;
      const content = section.querySelector<HTMLElement>(":scope > .container");
      if (!content) return;
      const animation = content.animate(
        [
          { opacity: 0.25, transform: `translateY(${direction * 18}px)` },
          { opacity: 1, transform: "none" },
        ],
        { id: "convert-entry-section", duration: motionTiming.section * 1000, easing: motionEasing },
      );
      animation.onfinish = () => animation.cancel();
      // Only replay a short heading sequence. Cards further down the section
      // retain their own viewport entrances instead of all restarting at once.
      const heading = content.querySelector<HTMLElement>("[data-motion-reveal]");
      if (heading) staggerContent(heading, { direction });
    };

    const arrive = (section: HTMLElement, direction: number) => {
      cancelAnimationFrame(frame);
      // One jump to the destination followed by a short reveal avoids a long
      // animated trip across the entire landing page.
      frame = requestAnimationFrame(() => {
        const header = document.querySelector(".site-header");
        const top = section.getBoundingClientRect().top + window.scrollY - (header?.getBoundingClientRect().height ?? 88) - 6;
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
        if (!section.hasAttribute("tabindex")) section.tabIndex = -1;
        section.focus({ preventScroll: true });
        revealSection(section, direction);
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      const section = sectionForHash(url.hash);
      if (!section) return;
      event.preventDefault();
      const direction = section.getBoundingClientRect().top >= 100 ? 1 : -1;
      if (location.hash !== url.hash) history.pushState(history.state, "", url.hash);
      arrive(section, direction);
    };

    const onHashChange = (event: HashChangeEvent) => {
      const section = sectionForHash(location.hash);
      if (!section) return;
      const previous = sectionForHash(new URL(event.oldURL).hash);
      const direction = sections.indexOf(section) >= sections.indexOf(previous ?? sections[0]) ? 1 : -1;
      arrive(section, direction);
    };

    const onPreferenceChange = () => {
      if (media.matches) sections.forEach(stopEntryMotion);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    media.addEventListener("change", onPreferenceChange);
    return () => {
      cancelAnimationFrame(frame);
      sections.forEach(stopEntryMotion);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
      media.removeEventListener("change", onPreferenceChange);
    };
  }, []);
}
