import requests
url = "http://google.com"
try:
    res = requests.post("http://localhost:10000/predict/explain", json={"url": url})
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print("Request failed:", e)
