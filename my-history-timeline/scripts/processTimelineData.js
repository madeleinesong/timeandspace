const fs = require("fs");
const path = require("path");

// Function to parse the timeline data
function parseTimelineData() {
  const inputFilePath = path.join(__dirname, "../src/lib/output.txt");
  const outputFilePath = path.join(__dirname, "../public/timelineData.json");

  const rawData = fs.readFileSync(inputFilePath, "utf-8");
  const parsedData = rawData
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [years, description] = line.split(":").map((part) => part.trim());
      return { years, description };
    });

  // Save parsed data to a JSON file
  fs.writeFileSync(outputFilePath, JSON.stringify(parsedData, null, 2));
  console.log(`Timeline data saved to ${outputFilePath}`);
}

// Run the function
parseTimelineData();
