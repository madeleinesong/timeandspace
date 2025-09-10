import json, re, pathlib

src = pathlib.Path("..public/weaponsdata.json")        # your input
dst = src                                         # overwrite same file (use a backup if you're scared)

def clean_event(txt: str) -> str:
    txt = re.sub(r"\s*(go to|see this event).*", "", txt, flags=re.I|re.S)
    return re.sub(r"\s+", " ", txt).strip()

def clean_year(txt: str) -> str:
    t = txt.strip()
    t = re.sub(r"(?i)^c\.\s*", "", t)         # drop "c. "
    t = t.replace(",", "")                    # kill 15,000 -> 15000
    m = re.match(r"^\s*(\d+)\s*(BC|BCE|AD)?\s*$", t, flags=re.I)
    if not m: return txt.strip()
    num, era = m.group(1), (m.group(2) or "").upper()
    if era == "BCE": era = "BC"
    if era == "":    era = "AD"
    return f"{num} {era}"

data = json.loads(src.read_text(encoding="utf-8"))

# if your json is {"items":[...]}, change data = data["items"]
if isinstance(data, dict) and "items" in data:
    items = data["items"]
else:
    items = data

for row in items:
    row["year"]  = clean_year(row["year"])
    row["event"] = clean_event(row["event"])

# sanity checks before write
assert not any("go to" in r["event"].lower() for r in items)
assert all(re.search(r"\b(BC|AD)$", r["year"]) for r in items)

src.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok, cleaned + overwrote:", src)
