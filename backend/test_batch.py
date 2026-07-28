"""
Test batch prediction endpoint
"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("🧪 TESTING BATCH PREDICTION")
print("=" * 60)

# Test batch
test_urls = [
    "http://paypal-secure.com/login",
    "https://www.google.com",
    "http://banking-verify.tk/account",
    "https://github.com",
    "http://suspicious-site.com",
    "invalid-url",  # Should fail
    "http://192.168.1.1/admin",
    "https://www.facebook.com",
]

payload = {"urls": test_urls}

try:
    response = requests.post(f"{BASE_URL}/predict/batch", json=payload)
    
    print(f"Status: {response.status_code}\n")
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"📊 Batch Summary:")
        print(f"  Total URLs: {result['total']}")
        print(f"  Successful: {result['successful']}")
        print(f"  Failed: {result['failed']}")
        
        print(f"\n✅ Successful Predictions:")
        for pred in result['results']:
            print(f"  {pred['url']}")
            print(f"    → {pred['prediction'].upper()} ({pred['confidence']*100:.0f}% confidence)")
        
        if result['errors']:
            print(f"\n❌ Errors:")
            for error in result['errors']:
                print(f"  [{error['index']}] {error['url']}")
                print(f"    → {error['error']}")
    else:
        print(f"❌ Request failed: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ BATCH TESTING COMPLETE!")
print("=" * 60)