"use client";

import React, { useEffect, useRef, useState } from "react";

type Row = {
  year: string;
  event: string;
  blurb: string;      // <-- NEW
  scale?: number;
  date?: string;
  image?: string;     // <-- optional image URL (http(s) or /public path)
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
  const [selectedEvent, setSelectedEvent] = useState<{ year: string; event: string } | null>(null);

  // --- time domain ---
  const maxYear = 2100;
  const minYear = -10000;
  const offset = Math.abs(minYear);

  // --- provisional scale levels (rename/reshape later) ---
  const scaleLevels = [
    "planetary",
    "species",
    "international/civilizational",
    "national",
    "regional",
    "city",
    "institution",
    "community",
    "individual",
    "organ",
    "cellular",
  ];
  const minContentHeight = (scaleLevels.length + 1) * pixelsPerScale;

  useEffect(() => {
    fetch("/weaponsAndWar.json")
      .then((r) => r.json())
      .then((d: Row[]) => setTimelineData(d)); // <-- ensure TS knows about blurb
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollToYear(1950);
    }, 100);
    return () => clearTimeout(t);
  }, [pixelsPerYear]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScrollLeft = (maxYear - minYear) * pixelsPerYear;
    if (el.scrollLeft > maxScrollLeft) el.scrollLeft = maxScrollLeft;
    if (el.scrollLeft < 0) el.scrollLeft = 0;
    // vertical clamping isn’t strictly necessary; browser handles it
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
    const isBC = /\bBC(E)?\b/i.test(y);
    const n = parseInt(y.replace(/[^\d]/g, ""), 10); // kill commas, c., etc
    return isBC ? -n : n;
  };

  // greedy lane placement to avoid overlap (vertical stacking)
  const laneHeight = 120;
  const cardWidth = (py: number) => Math.max(160, Math.min(360, 8 * py));

  const cards = timelineData
    .map((e) => {
      const adjustedYear = parseYear(e.year);
      const left = (adjustedYear + offset) * pixelsPerYear;
      const width = cardWidth(pixelsPerYear);
      return { e, left, width, adjustedYear };
    })
    .sort((a, b) => a.left - b.left); // place left→right

  const lanes: number[] = []; // last-right-x per lane
  const cardLane = cards.map((c) => {
    let lane = 0;
    while (lane < lanes.length && c.left < lanes[lane]) lane++;
    if (lane === lanes.length) lanes.push(-Infinity);
    lanes[lane] = c.left + c.width + 12; // reserve space (12px gap)
    return lane;
  });

  const panelRef = useRef<HTMLDivElement>(null);

  // NEW: close on Escape
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

  // NEW: close on click outside the panel (but allow clicking event cards)
  useEffect(() => {
    if (!isPanelOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (panelRef.current?.contains(el)) return;                  // clicks inside panel → ignore
      if (el.closest("[data-event-card]")) return;                 // clicks on event cards → let card handle (keeps panel)
      setIsPanelOpen(false);
      setSelectedEvent(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [isPanelOpen]);


  // --- 2D canvas dimensions ---
  const canvasWidth = (maxYear - minYear) * pixelsPerYear;
  // ensure we always have some meaningful Y to scroll (either lanes or scale grid)
  const contentHeight = Math.max(60 + lanes.length * laneHeight, minContentHeight);

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
        <div
          className={`transition-all duration-300 ${
            isPanelOpen ? "w-2/3" : "w-full"
          }`}
        >
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
              <div
                key={idx}
                className="absolute left-0 right-0 border-t border-gray-300 z-0"
                style={{ top: y }}
              >
                <div className="absolute left-2 -translate-y-1/2 text-xs text-gray-600 bg-white/80 px-1 rounded">
                  {idx}. {label}
                </div>
              </div>
            );
          })}

          {/* events (non-overlapping lanes) */}
          {cards.map((c, i) => {
            const isSelected = selectedEvent && selectedEvent.year === c.e.year && selectedEvent.event === c.e.event;
            return (
              <div
                key={i}
                className={`group absolute z-10 text-white rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? "bg-green-600 ring-2 ring-green-400 ring-offset-2" 
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                style={{
                  left: c.left,
                  top: 80 + cardLane[i] * laneHeight, // <-- now top-based, so it lives in scrollable content
                  width: c.width,
                }}
                title={`${c.e.year} — ${c.e.blurb}`}
                onClick={() => {
                  setSelectedEvent(c.e);
                  if (!isPanelOpen) {
                    setIsPanelOpen(true);
                  }
                }}
              >
                <div className="px-3 pt-2 pb-1 text-xs font-semibold opacity-90">{c.e.year}</div>
                <div className="px-3 pb-3 text-sm leading-snug max-h-20 overflow-hidden">
                  {c.e.blurb}
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>

        {/* Right Panel */}
        {isPanelOpen && (
          <div className="w-1/3 bg-white border-l border-gray-300 shadow-lg">
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">More Info</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  {selectedEvent ? (
                    <div className="space-y-3">
                      {/* image if present */}
                      {selectedEvent.image && (
                        <img
                          src={selectedEvent.image}
                          alt={selectedEvent.event || selectedEvent.blurb}
                          className="w-full h-40 object-cover rounded-lg border"
                          loading="lazy"
                        />
                      )}

                      <div className="text-lg font-bold text-gray-800">{selectedEvent.year}</div>

                      {/* blurb above event */}
                      {selectedEvent.blurb && (
                        <div className="text-gray-900 leading-relaxed font-medium">
                          {selectedEvent.blurb}
                        </div>
                      )}

                      {/* event headline / description */}
                      <div className="text-gray-700 leading-relaxed">
                        {selectedEvent.event}
                      </div>

                      {/* meta row */}
                      <div className="text-xs text-gray-500 grid grid-cols-2 gap-2 pt-2">
                        {selectedEvent.date && (
                          <div><span className="font-semibold">Date:</span> {selectedEvent.date}</div>
                        )}
                        {typeof selectedEvent.scale === "number" && (
                          <div><span className="font-semibold">Scale:</span> {selectedEvent.scale}</div>
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
                    <p className="text-gray-600 text-sm">Click on any event in the timeline to see details here.</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Analysis Tools</h3>
                  <div className="space-y-2">
                    <button className="w-full p-2 bg-blue-100 hover:bg-blue-200 rounded text-sm">
                      Compare Events
                    </button>
                    <button className="w-full p-2 bg-blue-100 hover:bg-blue-200 rounded text-sm">
                      Filter by Scale
                    </button>
                    <button className="w-full p-2 bg-blue-100 hover:bg-blue-200 rounded text-sm">
                      Export Data
                    </button>
                  </div>
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
    </div>
  );
}
