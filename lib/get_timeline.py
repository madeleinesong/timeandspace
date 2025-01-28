import requests
from bs4 import BeautifulSoup

# Fetch the webpage content
url = "https://www.southampton.ac.uk/~cpd/history.html"
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")

# Open a file to write the output
with open("output.txt", "w") as file:
    # Find all sections and extract date and description
    for section in soup.find_all("section"):
        rows = section.find_all("tr")
        for row in rows:
            date_cell = row.find("td", class_="left-cell")
            description_cell = row.find_all("td")[1] if len(row.find_all("td")) > 1 else None
            if date_cell and description_cell:
                date = date_cell.get_text(strip=True)
                description = description_cell.get_text(strip=True)
                # Write to the file in the format "date: description"
                file.write(f"{date}: {description}\n")
