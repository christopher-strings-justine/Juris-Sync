import requests
import json

url = "http://localhost:8001/api/analyze-bundle"
files = [('files', ('JurisSync_Demo_Legal_Bundle.pdf', open('JurisSync_Demo_Legal_Bundle.pdf', 'rb'), 'application/pdf'))]

response = requests.post(url, files=files)
print(json.dumps(response.json(), indent=2))
