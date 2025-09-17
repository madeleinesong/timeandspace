"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Row = {
  year: string;
  event: string;
  blurb: string;
  scale?: number;  // 0..10; 8 = universal band
  date?: string;
  image?: string;
  tags?: string[];
};

export default function HomePage() {
  const [timelineData, setTimelineData] = useState<Row[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- controls ---
  const [jumpYear, setJumpYear] = useState<number | "">(2024);
  const [jumpScale, setJumpScale] = useState<number | "">("");
  const [pixelsPerYear, setPixelsPerYear] = useState(10);
  const [pixelsPerScale, setPixelsPerScale] = useState(140);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Row | null>(null);

  // marquee + viewport pinning
  const [scrollX, setScrollX] = useState(0);
  const [viewportW, setViewportW] = useState(0);
  const marqueeSeqRef = useRef<HTMLDivElement>(null);
  const [marqueeW, setMarqueeW] = useState(0);

  // global weapons filter
  const [showWeapons, setShowWeapons] = useState(true);

  // --- time domain ---
  const maxYear = 2100;
  const minYear = -10000;
  const offset = Math.abs(minYear);

  const isWeapons = (e: Row) => e.tags?.includes("weapons") ?? false;

  // --- scale labels (index = scale id) ---
  const scaleLevels = [
    "planetary",                 // 0
    "species",                   // 1
    "international/civilizational", // 2
    "national",                  // 3
    "regional",                  // 4
    "city",                      // 5
    "institution",               // 6
    "community",                 // 7
    "individual",                // 8 (universal band)
    "organ",                     // 9
    "cellular",                  // 10
  ];
  const INDIVIDUAL_IDX = 8;

  const minContentHeight = (scaleLevels.length + 1) * pixelsPerScale;

  useEffect(() => {
    fetch("/weaponsAndWar.json")
    .then(r => r.json())
    .then((d: Row[]) => {
      const tagged = d.map(e => ({
        ...e,
        tags: [...(e.tags ?? []), "weapons"]
      }));
      setTimelineData(tagged);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollToYear(1950);
    }, 100);
    return () => clearTimeout(t);
  }, [pixelsPerYear]);

  // viewport measurement for the pinned marquee
  useEffect(() => {
    const measureViewport = () => setViewportW(scrollContainerRef.current?.clientWidth ?? 0);
    measureViewport();
    window.addEventListener("resize", measureViewport);
    return () => window.removeEventListener("resize", measureViewport);
  }, []);

  // marquee measurement
  useEffect(() => {
    const measure = () => setMarqueeW(marqueeSeqRef.current?.scrollWidth ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pixelsPerScale, pixelsPerYear, viewportW, timelineData]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScrollLeft = (maxYear - minYear) * pixelsPerYear;
    if (el.scrollLeft > maxScrollLeft) el.scrollLeft = maxScrollLeft;
    if (el.scrollLeft < 0) el.scrollLeft = 0;
    setScrollX(el.scrollLeft);
  };

  const scrollToYear = (year: number | "") => {
    if (year === "" || !scrollContainerRef.current) return;
    const constrainedYear = Math.min(Math.max(year, minYear), maxYear);
    const position = (constrainedYear + offset) * pixelsPerYear;
    scrollContainerRef.current.scrollTo({ left: position, behavior: "smooth" });
  };

  const scrollToScale = (scaleIndex: number | "") => {
    if (scaleIndex === "" || !scrollContainerRef.current) return;
    const i = Math.max(0, Math.min(scaleLevels.length - 1, scaleIndex));
    const y = i * pixelsPerScale; // top-origin
    scrollContainerRef.current.scrollTo({ top: y, behavior: "smooth" });
  };

  // ---- helpers ----
  const parseYear = (y: string) => {
    if (!y || !y.trim()) return null;
    const isBC = /\bBC(E)?\b/i.test(y);
    const n = parseInt(y.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(n)) return null;
    return isBC ? -n : n;
  };


  // separate the universal band (scale 8) from dated events
  const universal = useMemo(
    () => timelineData.filter((e) => e.scale === INDIVIDUAL_IDX && e.blurb?.trim()),
    [timelineData]
  );

  // filter and map dated events; keep them on ONE Y per scale, avoid overlap by pushing rightward
  const placedCards = useMemo(() => {
    // source events: not universal, valid year, and pass weapons filter
    const source = timelineData.filter(
      (e) =>
        e.scale !== INDIVIDUAL_IDX &&
        parseYear(e.year) !== null &&
        (showWeapons || !isWeapons(e))
    );

    // group by scale
    const byScale = new Map<number, Array<{ e: Row; left: number; width: number; adjustedYear: number }>>();
    const widthFor = (py: number) => Math.max(160, Math.min(360, 8 * py));
    for (const e of source) {
      const adjustedYear = parseYear(e.year)!;
      const left = (adjustedYear + offset) * pixelsPerYear;
      const width = widthFor(pixelsPerYear);
      const s = typeof e.scale === "number" ? e.scale : 2;
      if (!byScale.has(s)) byScale.set(s, []);
      byScale.get(s)!.push({ e, left, width, adjustedYear });
    }

    // within each scale lane: sort by left (time), then push right to avoid overlap (single horizontal plane)
    const GAP_X = 12;
    const out: Array<{ e: Row; left: number }> = [];
    for (const [scale, arr] of [...byScale.entries()].sort((a, b) => a[0] - b[0])) {
      const sorted = arr.sort((a, b) => a.left - b.left);
      let lastRight = -Infinity;
      for (const item of sorted) {
        const placedLeft = Math.max(item.left, lastRight + GAP_X);
        lastRight = placedLeft + item.width;
        out.push({ e: { ...item.e, scale }, left: placedLeft });
      }
    }
    return out;
  }, [timelineData, pixelsPerYear, showWeapons]);

  useEffect(() => {
    fetch("/weaponsAndWar.json")
      .then((r) => r.json())
      .then((d: Row[]) => {
        const tagged = d.map(e => ({ ...e, tags: [...(e.tags ?? []), "weapons"] }));
        setTimelineData(tagged);
      });
  }, []);

  // panel outside-click + Esc
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPanelOpen(false);
        setSelectedEvent(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!isPanelOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (panelRef.current?.contains(el)) return;
      if (el.closest("[data-event-card]")) return;
      setIsPanelOpen(false);
      setSelectedEvent(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [isPanelOpen]);

  // --- 2D canvas dimensions ---
  const canvasWidth = (maxYear - minYear) * pixelsPerYear;
  const contentHeight = Math.max(60 + scaleLevels.length * pixelsPerScale, minContentHeight);

  // consistent weapons color
  const WEAPONS_BLUE = "#1d4ed8"; // blue-600

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100">
      {/* header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-20 px-6 py-3 flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-black font-bold text-lg mr-6">timeline of everything</h1>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={jumpYear === "" ? "" : jumpYear}
            onChange={(e) => setJumpYear(Number(e.target.value) || "")}
            placeholder="year"
            className="p-2 border border-gray-300 rounded w-28 text-base"
          />
          <button onClick={() => scrollToYear(jumpYear)} className="px-3 py-2 bg-blue-600 text-white rounded">
            jump (X)
          </button>

          <input
            type="number"
            min={0}
            max={scaleLevels.length - 1}
            value={jumpScale === "" ? "" : jumpScale}
            onChange={(e) => setJumpScale(Number(e.target.value) || "")}
            placeholder="scale idx"
            className="p-2 border border-gray-300 rounded w-28 text-base"
            title="0 = top (planetary), larger = further down"
          />
          <button onClick={() => scrollToScale(jumpScale)} className="px-3 py-2 bg-purple-600 text-white rounded">
            jump (Y)
          </button>

          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="px-3 py-2 bg-green-600 text-white rounded ml-4"
          >
            {isPanelOpen ? "Close Panel" : "Open Panel"}
          </button>
        </div>
      </div>

      {/* Main content area with timeline and panel */}
      <div className="flex h-screen pt-16">
        {/* Timeline area */}
        <div className={`transition-all duration-300 ${isPanelOpen ? "w-2/3" : "w-full"}`}>
          {/* 2D scroller */}
          <div
            ref={scrollContainerRef}
            className="relative h-full overflow-auto bg-white border-t"
            onScroll={handleScroll}
            style={{ scrollBehavior: "smooth" }}
          >
            {/* inner canvas gives us explicit width & height so both axes can scroll */}
            <div className="relative" style={{ width: canvasWidth, height: contentHeight }}>
              {/* century bands spanning full height */}
              {Array.from({ length: (maxYear - minYear) / 100 + 1 }, (_, i) => {
                const year = minYear + i * 100;
                const left = (year + offset) * pixelsPerYear;
                const width = 100 * pixelsPerYear;
                const isEven = (year / 100) % 2 === 0;
                return (
                  <div
                    key={year}
                    className={`${isEven ? "bg-gray-200" : "bg-gray-300"} absolute top-0 text-gray-900 text-sm font-bold py-2 px-4 text-center pointer-events-none z-0`}
                    style={{ left, width, height: "100%" }}
                  >
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-70">
                      {year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`}
                    </div>
                  </div>
                );
              })}

              {/* Y-axis scale grid (horizontal lines + labels) */}
              {scaleLevels.map((label, idx) => {
                const y = idx * pixelsPerScale;
                return (
                  <div key={idx} className="absolute left-0 right-0 border-t border-gray-300 z-0" style={{ top: y }}>
                    <div className="absolute left-2 -translate-y-1/2 text-xs text-gray-600 bg-white/80 px-1 rounded">
                      {idx}. {label}
                    </div>
                  </div>
                );
              })}

              {/* === UNIVERSAL BAND @ scale 8 (animated loop) === */}
              {showWeapons &&universal.length > 0 && (
                <div
                  className="absolute z-10"
                  style={{
                    top: INDIVIDUAL_IDX * pixelsPerScale + 4,
                    left: scrollX,
                    width: viewportW || "100%",
                    height: Math.max(40, pixelsPerScale - 8),
                    pointerEvents: "none",
                  }}
                >
                  <div className="relative h-full overflow-hidden">
                    <div
                      className="flex items-center h-full whitespace-nowrap will-change-transform"
                      style={{
                        width: marqueeW ? marqueeW * 2 : "auto",
                        animation: marqueeW
                          ? `marquee ${Math.max(24, Math.min(90, Math.round(marqueeW / 30)))}s linear infinite`
                          : "none",
                      }}
                    >
                      {/* first copy (measured) */}
                      <div ref={marqueeSeqRef} className="flex items-center gap-8 pr-12">
                        {universal.map((u, i) => (
                          <span
                            key={`u1-${i}`}
                            className="px-3 py-1 rounded-full text-sm md:text-base bg-blue-700 text-white shadow"
                            >
                            {u.blurb}
                          </span>
                        ))}
                      </div>
                      {/* second copy */}
                      <div className="flex items-center gap-8 pr-12">
                        {universal.map((u, i) => (
                          <span
                            key={`u2-${i}`}
                            className="px-3 py-1 rounded-full text-sm md:text-base bg-blue-700 text-white shadow"
                            >
                            {u.blurb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* events — ONE horizontal plane per `scale` */}
              {placedCards.map((c, i) => {
                const yBase = (typeof c.e.scale === "number" ? c.e.scale : 2) * pixelsPerScale;
                const top = yBase + 16; // slight offset below the scale line

                const selected =
                  selectedEvent &&
                  selectedEvent.year === c.e.year &&
                  selectedEvent.event === c.e.event;

                const weapons = isWeapons(c.e);
                if (!showWeapons && weapons) return null; // global filter

                const baseCard =
                  "group absolute z-20 text-white rounded-lg shadow-md cursor-pointer transition-all duration-200";
                const nonWeaponsClass = selected
                  ? "bg-green-600 ring-2 ring-green-400 ring-offset-2"
                  : "bg-blue-500 hover:bg-blue-600";
                const weaponsStyle = weapons
                  ? { backgroundColor: WEAPONS_BLUE }
                  : undefined;

                return (
                  <div
                    key={i}
                    data-event-card
                    className={`${baseCard} ${weapons ? "" : nonWeaponsClass}`}
                    style={{
                      left: c.left,
                      top,
                      width: Math.max(160, Math.min(360, 8 * pixelsPerYear)),
                      ...(weaponsStyle || {}),
                    }}
                    title={`${c.e.year} — ${c.e.blurb || c.e.event}`}
                    onClick={() => {
                      setSelectedEvent(c.e);
                      if (!isPanelOpen) setIsPanelOpen(true);
                    }}
                  >
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold opacity-90">{c.e.year}</div>
                    <div className="px-3 pb-3 text-sm leading-snug max-h-20 overflow-hidden">
                      {c.e.blurb || c.e.event}
                    </div>

                    {/* hover popover (compact) */}
                    <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[28rem] max-w-[80vw] bg-white text-black rounded-xl shadow-2xl p-4 z-30">
                      <div className="text-xs font-semibold mb-1">{c.e.year}</div>
                      <div className="text-sm leading-snug font-medium mb-1">{c.e.blurb || c.e.event}</div>
                      {c.e.blurb && c.e.event && (
                        <div className="text-xs text-gray-600">{c.e.event}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {isPanelOpen && (
          <div ref={panelRef} className="w-1/3 bg-white border-l border-gray-300 shadow-lg">
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">More Info</h2>

              {/* weapons tag toggle */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Tags:</span>
                <button
                  onClick={() => setShowWeapons((v) => !v)}
                  className="text-xs font-semibold px-2 py-1 rounded-full border"
                  style={{
                    borderColor: WEAPONS_BLUE,
                    color: showWeapons ? "#fff" : WEAPONS_BLUE,
                    background: showWeapons ? WEAPONS_BLUE : "transparent",
                  }}
                  title={showWeapons ? "Hide all weapons items" : "Show weapons items"}
                >
                  Weapons
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  {selectedEvent ? (
                    <div className="space-y-3">
                      {selectedEvent.image && (
                        <img
                          src={selectedEvent.image}
                          alt={selectedEvent.event || selectedEvent.blurb}
                          className="w-full h-40 object-cover rounded-lg border"
                          loading="lazy"
                        />
                      )}

                      <div className="text-lg font-bold text-gray-800">{selectedEvent.year}</div>

                      {selectedEvent.blurb && (
                        <div className="text-gray-900 leading-relaxed font-medium">
                          {selectedEvent.blurb}
                        </div>
                      )}

                      <div className="text-gray-700 leading-relaxed">{selectedEvent.event}</div>

                      <div className="text-xs text-gray-500 grid grid-cols-2 gap-2 pt-2">
                        {selectedEvent.date && (
                          <div>
                            <span className="font-semibold">Date:</span> {selectedEvent.date}
                          </div>
                        )}
                        {typeof selectedEvent.scale === "number" && (
                          <div>
                            <span className="font-semibold">Scale:</span> {selectedEvent.scale}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Clear selection
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      Click on any event in the timeline to see details here.
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Timeline Controls</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pixels per Year</label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={pixelsPerYear}
                        onChange={(e) => setPixelsPerYear(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{pixelsPerYear}px</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pixels per Scale</label>
                      <input
                        type="range"
                        min="80"
                        max="200"
                        value={pixelsPerScale}
                        onChange={(e) => setPixelsPerScale(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{pixelsPerScale}px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* dynamic marquee keyframes (distance = measured width of one copy) */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${marqueeW}px); }
        }
      `}</style>
    </div>
  );
}
