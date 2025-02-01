import json
import re

def clean_unicode_escapes(text):
    """Removes all backslashes and the 4 characters following them (e.g., \u2019)."""
    return re.sub(r'\\u.{4}', '', text)

def clean_json_file(input_file, output_file):
    """Reads a JSON file, cleans unicode junk, and saves a new JSON file."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for event in data:
        if "description" in event:
            event["description"] = clean_unicode_escapes(event["description"])

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Cleaned JSON saved as {output_file}")

# usage
clean_json_file("../public/big.json", "../public/big.json")
