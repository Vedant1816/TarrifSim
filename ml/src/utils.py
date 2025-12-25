import os
import json

def save_json(data, path):
    """Save a Python dict as a JSON file."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

def load_json(path):
    """Load and return a JSON file as a Python dict."""
    with open(path, "r") as f:
        return json.load(f)
