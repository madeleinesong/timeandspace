"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [timelineData, setTimelineData] = useState([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [jumpYear, setJumpYear] = useState(2000);

  // Fetch timeline data
  useEffect(() => {
    fetch("/timelineData.json")
      .then((response) => response.json())
      .then((data) => setTimelineData(data));
  }, []);

  // Scroll to default year (2000) on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollToYear(2000);
    }
  }, [timelineData]);

  // Scroll to a specific year
  const scrollToYear = (year: number) => {
    if (!scrollContainerRef.current) return;

    const position = (year + 10000) * 10; // Map year to X-axis (1 year = 10px)
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
      <h1 className="text-center text-4xl font-bold py-4">Timeline of History</h1>

      {/* Jump To: Button */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
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

      <div
        ref={scrollContainerRef}
        className="relative flex h-[80vh] overflow-x-scroll bg-white border-t border-b border-gray-300"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* X-Axis with Vertical Lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 2200 }, (_, i) => {
            const year = i * 100 - 10000; // Map index to year (100-year intervals)
            return (
              <div
                key={i}
                className="flex-shrink-0 w-[100px] h-full border-r border-gray-300"
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

          const position = (adjustedYear + 10000) * 10; // Map year to X-axis position

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
