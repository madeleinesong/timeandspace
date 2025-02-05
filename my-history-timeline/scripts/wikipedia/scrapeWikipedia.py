import json
from bs4 import BeautifulSoup

def scrape_correctly(input_file, output_file):
    """Extracts only the dates and descriptions from the relevant DOM structure of the HTML file."""
    with open(input_file, "r", encoding="utf-8") as file:
        soup = BeautifulSoup(file, "html.parser")

    timeline = []

    # Locate the content section
    content_section = soup.find("div", {"class": "mw-parser-output"})
    if not content_section:
        print("Error: Could not locate content section in the HTML.")
        return

    # Extract <li> elements from the content section
    for li in content_section.find_all("li"):
        text = li.get_text(strip=True)
        if text:
            # Split into years and descriptions
            split_text = text.split(": ", 1)
            timeline.append({"years": split_text[0], "description": split_text[1]})

    # Save the results to a JSON file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=4, ensure_ascii=False)

    print(f"Scraped data saved to {output_file}")

# Example Usage
scrape_correctly("westernColonialism.html", "../../public/colonialism_timeline.json")
