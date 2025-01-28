import requests
from bs4 import BeautifulSoup

# Fetch the webpage content
url = "https://www.southampton.ac.uk/~cpd/history.html"
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")

# Open the existing file in append mode
with open("output.txt", "a") as file:
    # Find all sections and process them
    for section in soup.find_all("section"):
        rows = section.find_all("tr")
        for row in rows:
            # Handle the structure based on <td> elements
            tds = row.find_all("td")
            if len(tds) == 2:  # Structure for sections 0-3
                date_cell = tds[0].get_text(strip=True)
                description_cell = tds[1].get_text(strip=True)
                file.write(f"{date_cell}: {description_cell}\n")
            elif len(tds) == 3:  # Structure for sections 4+
                year = tds[0].get_text(strip=True)
                description_cell = tds[2].get_text(strip=True)
                file.write(f"{year}: {description_cell}\n")
