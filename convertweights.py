from transformers import LlamaForCausalLM, LlamaTokenizer, LlamaConfig
import torch
import os

# paths
input_model_path = "/Users/madeleinesong/.llama/checkpoints/Llama3.1-8B"
output_model_path = "/Users/madeleinesong/.llama/converted_model"

# load model config
config_path = os.path.join(input_model_path, "params.json")
config = LlamaConfig.from_json_file(config_path)

# load state dict from consolidated weights
state_dict = torch.load(f"{input_model_path}/consolidated.00.pth", map_location="cpu")

# create model and load state dict
model = LlamaForCausalLM(config)
model.load_state_dict(state_dict)

# save the model in hugging face format
model.save_pretrained(output_model_path)

# save tokenizer
tokenizer = LlamaTokenizer.from_pretrained(input_model_path)
tokenizer.save_pretrained(output_model_path)

print(f"model converted and saved to {output_model_path}")
