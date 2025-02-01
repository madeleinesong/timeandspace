import json

def convert_txt_to_json(input_file, output_file):
    """Reads a text file in 'Date: Description' format and converts it to JSON."""
    data = []

    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        if ":" in line:  # Ensure the line has the expected format
            years, description = line.split(":", 1)  # Split only on the first colon
            data.append({"years": years.strip(), "description": description.strip()})

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Converted JSON saved as {output_file}")

# usage
convert_txt_to_json("../public/medium.txt", "../public/medium.json")
