"""
Test explanation endpoint
"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("🧪 TESTING EXPLANATION ENDPOINT")
print("=" * 60)

test_urls = [
    "http://paypal-secure.com/login",
    "https://www.google.com",
    "http://banking-verify.tk/account"
]

for i, url in enumerate(test_urls, 1):
    print(f"\n{i}️⃣  Testing: {url}")
    print("-" * 60)
    
    try:
        # Get prediction
        pred_response = requests.post(
            f"{BASE_URL}/predict/",
            json={"url": url}
        )
        
        if pred_response.status_code == 200:
            pred_result = pred_response.json()
            print(f"Prediction: {pred_result['prediction'].upper()}")
            print(f"Confidence: {pred_result['confidence']*100:.1f}%")
        
        # Get explanation
        exp_response = requests.post(
            f"{BASE_URL}/predict/explain",
            json={"url": url}
        )
        
        if exp_response.status_code == 200:
            exp_result = exp_response.json()
            print(f"\n📊 Top 5 Contributing Features:")
            for feat in exp_result['top_features'][:5]:
                impact_symbol = "⬆️" if feat['impact'] == "positive" else "⬇️"
                print(f"  {impact_symbol} {feat['feature']:<30} | "
                      f"Value: {feat['value']:.3f} | "
                      f"Contribution: {feat['contribution']:.4f}")
        else:
            print(f"❌ Explanation failed: {exp_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ EXPLANATION TESTING COMPLETE!")
print("=" * 60)