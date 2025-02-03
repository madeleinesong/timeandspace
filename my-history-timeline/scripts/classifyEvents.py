import json
import openai  # Install with: pip install openai

# Configure your OpenAI API key
openai.api_key = "your_openai_api_key"

def classify_event(description):
    """Uses GPT-4 to determine if an event is 'big-scale' or 'individual-scale'."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": 
                 "You are an expert historian sorting events into two categories:\n"
                 "- 'big-scale' for geological, national, and international events\n"
                 "- 'individual-scale' for personal achievements, biographies, and discoveries.\n"
                 "Classify the following event: \n"},
                {"role": "user", "content": f"Event: {description}\n\n"
                 "Reply with just 'big-scale' or 'individual-scale'—no extra text."}
            ],
            max_tokens=10,
            temperature=0.3
        )
        
        classification = response["choices"][0]["message"]["content"].strip().lower()
        return classification

    except Exception as e:
        print(f"Error: {e}")
        return "big-scale"  # Default to big-scale if classification fails

def sort_events(big_file, medium_file):
    """Sorts events into big.json (global/national/geological) and medium.json (individual)."""
    
    # Load JSON files
    with open(big_file, "r", encoding="utf-8") as f:
        big_events = json.load(f)
    with open(medium_file, "r", encoding="utf-8") as f:
        medium_events = json.load(f)

    # Merge events for classification
    all_events = big_events + medium_events

    # Empty lists for sorted events
    new_big = []
    new_medium = []

    # Classify each event
    for event in all_events:
        classification = classify_event(event["description"])
        if classification == "big-scale":
            new_big.append(event)
        else:
            new_medium.append(event)

    # Save sorted JSON files
    with open("sorted_big.json", "w", encoding="utf-8") as f:
        json.dump(new_big, f, indent=2)
    with open("sorted_medium.json", "w", encoding="utf-8") as f:
        json.dump(new_medium, f, indent=2)

    print("Sorting complete: saved to sorted_big.json and sorted_medium.json")

# Run sorting
sort_events("big.json", "medium.json")
