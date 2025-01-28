import React from "react";
import { parseTimelineData } from "@/lib/parseTimelineData";

// Raw data
const rawData = `
13,800,000,000: Big Bang singularity:cosmic inflation, creation of all particles of matter...
13,550,000,000: Ignition of hydrogen stars, bathing the Universe in the first light of cosmic dawn...
13,000,000,000: Aggregation of stars into the Milky Way galaxy...
4,570,000,000: Formation of the Sun and Solar System...
`;

export default function HomePage() {
  const timelineData = parseTimelineData(rawData);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Timeline of the Universe</h1>
      <section className="space-y-4">
        {timelineData.map((event) => (
          <article
            key={event.id}
            className="border-l-4 border-blue-500 p-4 bg-gray-50"
          >
            <h2 className="text-xl font-semibold">
              {event.yearsAgo.toLocaleString()} years ago
            </h2>
            <p className="mt-2">{event.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
