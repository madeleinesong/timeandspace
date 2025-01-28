// lib/parseTimelineData.js
export function parseTimelineData(rawData) {
  // Split lines, filter non-empty ones
  const lines = rawData.split("\n").map((line) => line.trim()).filter(Boolean);

  return lines.map((line, index) => {
    const [yearsAgo, description] = line.split(":").map((part) => part.trim());
    return {
      id: index + 1, // Unique ID
      yearsAgo: parseInt(yearsAgo.replace(/,/g, "")), // Remove commas for number parsing
      description,
    };
  });
}
