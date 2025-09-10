import json, re, requests
from bs4 import BeautifulSoup

URL = "https://www.oxfordreference.com/display/10.1093/acref/9780191737930.timeline.0001"
headers = {"User-Agent":"Mozilla/5.0"}

html = requests.get(URL, headers=headers, timeout=30).text
soup = BeautifulSoup(html, "lxml")

rows = soup.select("#readPanel .year_event_container .year_event tr.myrow")
data = []
for r in rows:
    tds = r.find_all("td")
    if len(tds) < 2: 
        continue
    year = re.sub(r"\s+", " ", tds[0].get_text(strip=True))
    event = " ".join(tds[1].stripped_strings)
    if year and event:
        data.append({"year": year, "event": event})

with open("../public/weaponsdata.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"ok, wrote {len(data)} records")
