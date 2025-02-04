import json
from openai import OpenAI

from dotenv import load_dotenv
import os

load_dotenv()  # this loads .env variables into os.environ

apikey = os.getenv("API_KEY")

client = OpenAI(api_key=apikey)  # install openai library if not already done: pip install openai

# configure your openai api key

def paraphrase_descriptions(data):
    """Sends all event descriptions in one request to GPT-4 for batch processing."""
    descriptions = [event.get("description", "") for event in data]

    prompt = (
        "Edit these historical event descriptions to be punchier, grammatically correct, and under 70 characters each. "
        "For example:\n"
        "- 'Domestication of horses (Central Asian steppes), revolutionizing mobility, economy, warfare' → 'Men feel cool on horses'\n"
        "- 'earliest evidence of human ancestors outside of Africa' -> 'humans leave africa''\n"
        "- 'Alfred Sax invents the saxophone.' -> 'saxophone \n\n"
        "Here are the event descriptions:\n"
    )

    formatted_descriptions = "\n".join([f"{i+1}. {desc}" for i, desc in enumerate(descriptions)])

    try:
        response = client.chat.completions.create(model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": 
             "You are an expert on the history of everything. You are incredibly witty and cool and your knowledge is both nuanced and broad. "
             "You are accurate and incredibly specific, and you love the little details in human history that make us human. "
             "However, you hate redundancy and especially abhor complex/academic language for the sake of sounding complex/academic."},
            {"role": "user", "content": prompt + formatted_descriptions}
        ],
        max_tokens=1500,  # Ensures enough space for all responses
        temperature=0.7)

        edited_descriptions = response.choices[0].message.content.strip().split("\n")
        return [desc.split(". ", 1)[-1] for desc in edited_descriptions if ". " in desc]

    except Exception as e:
        print(f"Error: {e}")
        return descriptions  # fallback to original descriptions

# read json (handling list format correctly)
with open("../public/merged.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# process data
new_descriptions = paraphrase_descriptions(data)
for i, event in enumerate(data):
    event["description"] = new_descriptions[i] if i < len(new_descriptions) else event["description"]

# write updated json
with open("../public/newmerged.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Updated JSON saved as new_timelinedata.json")