from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# specify the model directory
model_path = "/Users/madeleinesong/.llama/checkpoints/Llama3.1-8B"

# load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)

# move to gpu if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

# read the prompt from a text file
with open("prompts.txt", "r") as file:
    prompt = file.read()

# tokenize the prompt
inputs = tokenizer(prompt, return_tensors="pt").to(device)

# generate 30 more examples
output = model.generate(
    input_ids=inputs["input_ids"],  # pass tokenized inputs explicitly
    attention_mask=inputs["attention_mask"],
    max_new_tokens=100,  # adjust as needed for example length
    num_return_sequences=30,  # generate 30 outputs
    temperature=0.7,  # adjust for randomness (lower = deterministic)
    top_p=0.9,  # nucleus sampling for diversity
)

# decode and save responses to a file
responses = [tokenizer.decode(out, skip_special_tokens=True) for out in output]

# write responses to a new file
with open("generated_examples.txt", "w") as output_file:
    for idx, response in enumerate(responses):
        output_file.write("Example {}:\n{}\n\n".format(idx + 1, response))

print("Generated examples and saved to generated_examples.txt")
