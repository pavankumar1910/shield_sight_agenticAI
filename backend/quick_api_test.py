# backend/quick_api_test.py
import requests
import json

def quick_test():
    print("🚀 Quick API Test...")
    
    try:
        response = requests.post(
            "http://localhost:8000/predict/",
            json={"url": "https://google.com"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"URL: {data['url']}")
            print(f"Prediction: {data['prediction']}")
            print(f"Confidence: {data['confidence']:.2%}")
            print(f"Phishing Prob: {data['phishing_probability']:.4f}")
            print(f"Legit Prob: {data['legitimate_probability']:.4f}")
            
            # Check new features
            print(f"\n✨ NEW FEATURES:")
            print(f"Summary exists: {'Yes' if data.get('summary') else 'No'}")
            print(f"Availability exists: {'Yes' if data.get('availability') else 'No'}")
            
            if data.get('availability'):
                avail = data['availability']
                print(f"🌐 Status: {avail.get('status')}")
                print(f"Accessible: {avail.get('accessible')}")
                print(f"SSL Valid: {avail.get('ssl_valid')}")
            
            print(f"\n⏱️  Processing time: {data.get('metadata', {}).get('processing_time_ms', 0)}ms")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    quick_test()