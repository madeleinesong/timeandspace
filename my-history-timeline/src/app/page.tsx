"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [timelineData, setTimelineData] = useState([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [jumpYear, setJumpYear] = useState(2000);
  const [pixelsPerYear, setPixelsPerYear] = useState(10); // Default: 10px per year
  const maxYear = 2100; // Stop at 2100
  const minYear = -10000; // Start at 10,000 BCE
  const totalYears = maxYear - minYear; // Total range of years
  const offset = Math.abs(minYear); // Offset for BCE years

  // Fetch timeline data
  useEffect(() => {
    fetch("/big.json")
      .then((response) => response.json())
      .then((data) => setTimelineData(data));
  }, []);

  // Prevent scrolling past 2100
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const maxScrollLeft = totalYears * pixelsPerYear; // Position of 2100
    if (scrollContainerRef.current.scrollLeft > maxScrollLeft) {
      scrollContainerRef.current.scrollLeft = maxScrollLeft; // Lock scroll
    }
  };

  // Scroll to a specific year
  const scrollToYear = (year: number) => {
    if (!scrollContainerRef.current) return;

    const constrainedYear = Math.min(Math.max(year, minYear), maxYear); // Constrain year within range
    const position = (constrainedYear + offset) * pixelsPerYear; // Apply offset for BCE
    scrollContainerRef.current.scrollTo({
      left: position,
      behavior: "smooth",
    });
  };

  // Handle "Jump To" functionality
  const handleJump = () => {
    scrollToYear(jumpYear);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100">
      <h1 className="text-left text-4xl font-bold text-black py-4">Timeline of Everything</h1>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {/* Adjust Pixels Per Year */}
        <select
          value={pixelsPerYear}
          onChange={(e) => setPixelsPerYear(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded bg-white text-black"
        >
          <option value={5}>5 px/year</option>
          <option value={10}>10 px/year</option>
          <option value={20}>20 px/year</option>
          <option value={50}>50 px/year</option>
        </select>

        {/* Jump To: Input */}
        <input
          type="number"
          value={jumpYear}
          onChange={(e) => setJumpYear(Number(e.target.value))}
          placeholder="Year (e.g., 2000)"
          className="p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleJump}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Jump To
        </button>
      </div>

      {/* Timeline Container */}
      <div
        ref={scrollContainerRef}
        className="relative flex h-[80vh] overflow-x-scroll bg-white border-t border-b border-gray-300"
        onScroll={handleScroll} // Add scroll lock
        style={{ scrollBehavior: "smooth" }}
      >
        {/* X-Axis with Vertical Lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalYears }, (_, i) => {
            const year = minYear + i; // Calculate year
            return (
              <div
                key={year}
                className="flex-shrink-0 h-full border-r border-gray-300"
                style={{ width: `${pixelsPerYear}px` }} // Adjust width based on scale
              >
                <div className="absolute bottom-0 left-0 transform translate-x-[-50%] text-sm text-gray-500">
                  {year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Events */}
        {timelineData.map((event, index) => {
          const eventYear = parseInt(event.years.replace(/,/g, ""), 10);
          const adjustedYear =
            event.years.includes("BC") || event.years.includes("BCE")
              ? -eventYear
              : eventYear;

          const position = (adjustedYear + offset) * pixelsPerYear; // Apply offset for BCE years

          return (
            <div
              key={index}
              className="absolute bottom-10 flex-shrink-0 bg-blue-500 text-white p-4 rounded-lg shadow-md"
              style={{ left: `${position}px` }}
            >
              <h2 className="text-xl font-semibold">{event.years}</h2>
              <p>{event.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
