import { useRef, useState, useEffect, type RefObject } from "react";

export function useCharCols(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let chWidth = 0;

    const measureChar = () => {
      const probe = document.createElement("span");
      probe.style.visibility = "hidden";
      probe.style.position = "absolute";
      probe.style.whiteSpace = "pre";
      probe.textContent = "0000000000";
      el.appendChild(probe);
      chWidth = probe.getBoundingClientRect().width / 10;
      el.removeChild(probe);
    };

    const updateCols = () => {
      if (chWidth > 0) {
        setCols(Math.floor(el.clientWidth / chWidth));
      }
    };

    const init = () => {
      measureChar();
      updateCols();
    };

    init();
    document.fonts.ready.then(init);

    const observer = new ResizeObserver(updateCols);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, cols];
}
