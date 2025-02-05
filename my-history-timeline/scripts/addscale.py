import json
import re

def add_scale_field(input_file, output_file):
    """Adds a 'scale' field with a default value of -1 to each event."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for event in data:
        event["scale"] = -1  # Default scale value

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Updated JSON saved as {output_file}")

# usage
add_scale_field("../public/newmerged.json", "../public/newmerged.json")

def clean_description(input_file, output_file):
    """Removes words: 'early', 'earliest', 'first' (case-insensitive) from event descriptions."""
    
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for event in data:
        if isinstance(event, dict) and "description" in event:  # Ensure event has a description
            event["description"] = re.sub(r'\b(early|earliest|first)\b', '', event["description"], flags=re.IGNORECASE).strip()

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

clean_description("../public/newmerged.json", "../public/newmerged.json")


def process_json(input_file, output_file):
    """Adds a 'scale' field and cleans descriptions."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for event in data:
        event["scale"] = -1  # Default scale value

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Updated JSON saved as {output_file}")

# usage
process_json("../public/newmerged.json", "../public/newmerged.json")
