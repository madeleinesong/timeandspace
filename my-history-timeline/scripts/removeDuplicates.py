import json

with open("../public/data.json", "r") as f:
    data = json.load(f)

seen_descriptions = set()
deduped = []

for entry in data:
    desc = entry["description"].strip().lower()
    if desc not in seen_descriptions:
        seen_descriptions.add(desc)
        deduped.append(entry)

with open("../public/data.json", "w") as f:
    json.dump(deduped, f, indent=2)

print(f"deduped in-place: {len(data)} → {len(deduped)}")
