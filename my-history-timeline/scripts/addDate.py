import json

def add_scale_field(input_file, output_file):
    """Adds a 'scale' field with a default value of -1 to each event."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for event in data:
        event["date"] = ""  # Default date value

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Updated JSON saved as {output_file}")

# usage
add_scale_field("../public/weapons.json", "../public/weapons.json")
