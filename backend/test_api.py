"""
Test API endpoints with Python requests
"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing ShieldSight API...")
print("=" * 60)

# Test 1: Health check
print("\n1. Testing Health Check:")
response = requests.get(f"{BASE_URL}/health")
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")

# Test 2: Model info
print("\n2. Testing Model Info:")
response = requests.get(f"{BASE_URL}/model/info")
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")

# Test 3: Prediction - Phishing URL
print("\n3. Testing Prediction (Phishing):")
test_url = "http://paypal-secure.com/login"
payload = {"url": test_url}
response = requests.post(f"{BASE_URL}/predict/", json=payload)
print(f"   URL: {test_url}")
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"   Prediction: {result['prediction']}")
    print(f"   Confidence: {result['confidence']:.2%}")
    print(f"   Risk Level: {result['risk_level']}")

# Test 4: Prediction - Legitimate URL
print("\n4. Testing Prediction (Legitimate):")
test_url = "https://www.google.com"
payload = {"url": test_url}
response = requests.post(f"{BASE_URL}/predict/", json=payload)
print(f"   URL: {test_url}")
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"   Prediction: {result['prediction']}")
    print(f"   Confidence: {result['confidence']:.2%}")
    print(f"   Risk Level: {result['risk_level']}")

print("\n" + "=" * 60)
print("✅ API tests complete!")