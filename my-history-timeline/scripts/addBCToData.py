import json
import os

def add_bc_to_json(input_file, output_file):
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        return
    
    # Load JSON data
    with open(input_file, "r") as infile:
        data = json.load(infile)
    
    # Append "BC" to the "years" field if numeric
    for entry in data:
        years = entry.get("years", "")
        if all(char.isdigit() or char == ',' for char in years.replace(',', '')):
            entry["years"] = f"{years} BC"
    
    # Save updated data to the output file
    with open(output_file, "w") as outfile:
        json.dump(data, outfile, indent=2)
    
    print(f"Updated JSON saved to {output_file}")

# Paths for the input and output files
input_file = "/Users/madeleinesong/timeandspace/timeandspace/my-history-timeline/public/timelineDataBC.json"
output_file = "/Users/madeleinesong/timeandspace/timeandspace/my-history-timeline/public/timelineDataBC.json"

# Run the function
add_bc_to_json(input_file, output_file)
