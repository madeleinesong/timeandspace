"use client";

import React, { useEffect, useRef, useState } from "react";

type Row = { year: string; event: string };

export default function HomePage() {
  const [timelineData, setTimelineData] = useState<Row[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [jumpYear, setJumpYear] = useState<number | "">  (2024);
  const [pixelsPerYear, setPixelsPerYear] = useState(10);
  const [inputPixels, setInputPixels] = useState("");
  const maxYear = 2100;
  const minYear = -10000;
  const offset = Math.abs(minYear);

  useEffect(() => {
    fetch("/weapons.json").then(r => r.json()).then(setTimelineData);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollToYear(2024), 100);
    return () => clearTimeout(t);
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScrollLeft = (maxYear - minYear) * pixelsPerYear;
    if (el.scrollLeft > maxScrollLeft) el.scrollLeft = maxScrollLeft;
  };

  const scrollToYear = (year: number | "") => {
    if (year === "" || !scrollContainerRef.current) return;
    const constrainedYear = Math.min(Math.max(year, minYear), maxYear);
    const position = (constrainedYear + offset) * pixelsPerYear;
    scrollContainerRef.current.scrollTo({ left: position, behavior: "smooth" });
  };

  const handlePixelsPerYearChange = () => {
    const parsedValue = Number(inputPixels);
    if (!Number.isNaN(parsedValue) && parsedValue >= 1) setPixelsPerYear(parsedValue);
  };

  // ---- helpers ----
  const parseYear = (y: string) => {
    const isBC = /\bBC(E)?\b/i.test(y);
    const n = parseInt(y.replace(/[^\d]/g, ""), 10); // kill commas, c., etc
    return isBC ? -n : n;
  };

  // greedy lane placement to avoid overlap
  const laneHeight = 120;
  const cardWidth = (py: number) => Math.max(160, Math.min(360, 8 * py));

  const cards = timelineData.map((e) => {
    const adjustedYear = parseYear(e.year);
    const left = (adjustedYear + offset) * pixelsPerYear;
    const width = cardWidth(pixelsPerYear);
    return { e, left, width, adjustedYear };
  }).sort((a,b)=>a.left-b.left); // place left→right

  const lanes: number[] = [];              // last-right-x per lane
  const cardLane = cards.map((c) => {
    let lane = 0;
    while (lane < lanes.length && c.left < lanes[lane]) lane++;
    if (lane === lanes.length) lanes.push(-Infinity);
    lanes[lane] = c.left + c.width + 12;   // reserve space (12px gap)
    return lane;
  });

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100">
      {/* header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-20 px-6 py-3 flex items-center justify-between">
        <h1 className="text-black font-bold text-lg mr-6">timeline of everything</h1>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={inputPixels}
            onChange={(e) => setInputPixels(e.target.value)}
            placeholder="px / year"
            className="p-2 border border-gray-300 rounded w-24 text-base"
          />
          <button onClick={handlePixelsPerYearChange} className="px-3 py-2 bg-green-600 text-white rounded">
            set scale
          </button>
          <input
            type="number"
            value={jumpYear as number | undefined}
            onChange={(e) => setJumpYear(Number(e.target.value) || "")}
            placeholder="year"
            className="p-2 border border-gray-300 rounded w-28 text-base"
          />
          <button onClick={() => scrollToYear(jumpYear)} className="px-3 py-2 bg-blue-600 text-white rounded">
            jump
          </button>
        </div>
      </div>

      {/* timeline */}
      <div
        ref={scrollContainerRef}
        className="relative h-[88vh] mt-16 overflow-auto bg-white border-t"
        onScroll={handleScroll}
        style={{ scrollBehavior: "smooth" }}
      >
        {/* century bands */}
        {Array.from({ length: (maxYear - minYear) / 100 + 1 }, (_, i) => {
          const year = minYear + i * 100;
          const position = (year + offset) * pixelsPerYear;
          const width = 100 * pixelsPerYear;
          const isEven = (year / 100) % 2 === 0;
          return (
            <div
              key={year}
              className={`${isEven ? "bg-gray-200" : "bg-gray-300"} absolute bottom-0 text-gray-900 text-sm font-bold py-2 px-4 text-center pointer-events-none z-0`}
              style={{ left: position, width: width, minWidth: 100 }}
            >
              {year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`}
            </div>
          );
        })}

        {/* events (non-overlapping lanes) */}
        {cards.map((c, i) => (
          <div
            key={i}
            className="group absolute z-10 bg-blue-500 text-white rounded-lg shadow-md"
            style={{
              left: c.left,
              bottom: 40 + cardLane[i] * laneHeight,
              width: c.width,
            }}
            title={`${c.e.year} — ${c.e.event}`}
          >
            <div className="px-3 pt-2 pb-1 text-xs font-semibold opacity-90">{c.e.year}</div>
            <div className="px-3 pb-3 text-sm leading-snug max-h-20 overflow-hidden">
              {c.e.event}
            </div>

            {/* hover popover for full text */}
            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[28rem] max-w-[80vw] bg-white text-black rounded-xl shadow-2xl p-4 z-30">
              <div className="text-xs font-semibold mb-1">{c.e.year}</div>
              <div className="text-sm leading-snug">{c.e.event}</div>
            </div>
          </div>
        ))}

        {/* give vertical space for lanes */}
        <div style={{ height: 60 + lanes.length * laneHeight }} />
      </div>
    </div>
  );
}
