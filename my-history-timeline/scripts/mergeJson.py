import json

def load_json(file_path):
    """Loads a JSON file and returns the data."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def sort_events(events):
    """Sorts events chronologically (handles both BC and AD years)."""
    def year_key(event):
        year = event["years"].replace(",", "").split(" ")[0]  # Remove commas & keep first part
        if "BC" in event["years"]:
            return -int(year.replace("BC", "").strip())  # BC years as negative
        return int(year)  # AD years as positive

    return sorted(events, key=year_key)

def merge_json_files(big_file, medium_file, output_file):
    """Removes duplicate events, merges the two files, and sorts them chronologically."""
    big_events = load_json(big_file)
    medium_events = load_json(medium_file)

    # Merge and sort
    merged_events = sort_events(big_events + medium_events)

    # Save cleaned merged file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(merged_events, f, indent=2)

    print(f"Merged JSON saved as {output_file}")

# Run the script
merge_json_files("../public/big.json", "../public/medium.json", "merged.json")
