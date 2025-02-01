"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [timelineData, setTimelineData] = useState([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [jumpYear, setJumpYear] = useState(2024);
  const [pixelsPerYear, setPixelsPerYear] = useState(10);
  const [inputPixels, setInputPixels] = useState("");
  const maxYear = 2100;
  const minYear = -10000;
  const offset = Math.abs(minYear);

  useEffect(() => {
    fetch("/big.json")
      .then((response) => response.json())
      .then((data) => setTimelineData(data));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollToYear(2024);
      }
    }, 100);
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const maxScrollLeft = (maxYear - minYear) * pixelsPerYear;
    if (scrollContainerRef.current.scrollLeft > maxScrollLeft) {
      scrollContainerRef.current.scrollLeft = maxScrollLeft;
    }
  };

  const scrollToYear = (year: number) => {
    if (!scrollContainerRef.current) return;
    const constrainedYear = Math.min(Math.max(year, minYear), maxYear);
    const position = (constrainedYear + offset) * pixelsPerYear;
    scrollContainerRef.current.scrollTo({
      left: position,
      behavior: "smooth",
    });
  };

  const handleJump = () => {
    scrollToYear(jumpYear);
  };

  const handlePixelsPerYearChange = () => {
    const parsedValue = Number(inputPixels);
    if (!isNaN(parsedValue) && parsedValue >= 1) {
      setPixelsPerYear(parsedValue);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100">
      {/* Fixed Header in One Row */}
      <div
        className="fixed top-0 left-0 w-full bg-white shadow-md z-10 px-6 py-3 flex items-center justify-between"
        style={{
          fontSize: "1rem",
          transform: "scale(1)",
          transformOrigin: "top left",
          whiteSpace: "nowrap", // Prevent wrapping
        }}
      >
        <h1 className="text-black font-bold text-lg mr-6">Timeline of Everything</h1>
        
        {/* Controls in One Line */}
        <div className="flex items-center space-x-4">
          {/* Set Scale */}
          <input
            type="number"
            value={inputPixels}
            onChange={(e) => setInputPixels(e.target.value)}
            placeholder="Pixels/Year"
            className="p-2 border border-gray-300 rounded w-24 text-base"
            style={{ fontSize: "1rem !important" }}
          />
          <button
            onClick={handlePixelsPerYearChange}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-base"
            style={{ fontSize: "1rem !important" }}
          >
            Set Scale
          </button>

          {/* Jump To Year */}
          <input
            type="number"
            value={jumpYear}
            onChange={(e) => setJumpYear(Number(e.target.value) || "")}
            placeholder="Year (e.g., 2000)"
            className="p-2 border border-gray-300 rounded w-24 text-base"
            style={{ fontSize: "1rem !important" }}
          />
          <button
            onClick={handleJump}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-base"
            style={{ fontSize: "1rem !important" }}
          >
            Jump To
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={scrollContainerRef}
        className="relative flex h-[88vh] overflow-scroll bg-white border-t mt-16"
        onScroll={handleScroll}
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Century Banners (Full Width) */}
        {Array.from({ length: (maxYear - minYear) / 100 + 1 }, (_, i) => {
          const year = minYear + i * 100;
          const position = (year + offset) * pixelsPerYear;
          const width = 100 * pixelsPerYear;
          const isEven = (year / 100) % 2 === 0;

          return (
            <div
              key={year}
              className={`absolute bottom-0 text-gray-900 text-sm font-bold py-2 px-4 text-center ${
                isEven ? "bg-gray-200" : "bg-gray-300"
              }`}
              style={{
                left: `${position}px`,
                width: `${width}px`,
                minWidth: "100px",
              }}
            >
              {year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`}
            </div>
          );
        })}

        {/* Timeline Events */}
        {timelineData.map((event, index) => {
          const eventYear = parseInt(event.years.replace(/,/g, ""), 10);
          const adjustedYear =
            event.years.includes("BC") || event.years.includes("BCE")
              ? -eventYear
              : eventYear;

          const position = (adjustedYear + offset) * pixelsPerYear;

          return (
            <div
              key={index}
              className="absolute bottom-10 flex-shrink-0 bg-blue-500 text-white p-4 rounded-lg shadow-md"
              style={{ left: `${position}px` }}
            >
              {/* Only show year every century */}
              {(adjustedYear % 100 === 0 || index === 0) && (
                <div className="text-center font-bold text-lg mb-2">{event.years}</div>
              )}
              <p>{event.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
