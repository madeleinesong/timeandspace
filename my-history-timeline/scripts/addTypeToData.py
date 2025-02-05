import json
import re

def add_type_field(input_file, output_file):
    """Adds a 'scale' field with a default value of -1 to each event."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for event in data:
        event["type"] = "None"  # Default scale value

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Updated JSON saved as {output_file}")

# usage
add_type_field("../public/data.json", "../public/data.json")

import json

def remove_duplicates(input_file, output_file):
    """Removes duplicate entries from the JSON file."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Use a set to track unique items based on 'years' and 'description' fields
    unique_events = []
    seen = set()
    for event in data:
        # Create a unique identifier for each event
        identifier = (event["years"], event["description"])
        if identifier not in seen:
            seen.add(identifier)
            unique_events.append(event)
    
    # Save the unique events to the output file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(unique_events, f, indent=2)

    print(f"Updated JSON with duplicates removed saved as {output_file}")


# usage
add_type_field("../public/data.json", "../public/data.json")