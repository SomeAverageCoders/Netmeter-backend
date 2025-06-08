import json
import requests

# Read from the JSON file
with open("network_usage.json", "r") as file:
    data = json.load(file)

# Send the data to your Next.js API
response = requests.post("http://localhost:3000/api/usage", json=data)

# Print the result
print(response.status_code)
print(response.json())
