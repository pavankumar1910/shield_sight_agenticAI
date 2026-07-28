
import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.routes.predict import analyze_domain_risk, predict_single_url
from backend.app.ml_model import ml_model

async def test_typo_squatting():
    print("🚀 Starting Typo-squatting Verification...")
    
    # Mock ML model if needed, but it should be loaded if the server is running
    # If not, it might fail. Let's assume we can import and run.
    
    test_urls = [
        "https://www.gogle.com",
        "https://www.paypa1.com",
        "https://www.google.com"
    ]
    
    for url in test_urls:
        print(f"\n🔍 Analyzing: {url}")
        is_white, reason, boost = analyze_domain_risk(url)
        print(f"  Whitelist: {is_white}")
        print(f"  Reason: {reason}")
        print(f"  Boost: {boost}")
        
        try:
            # We need to ensure the model is loaded or mock it
            # For simplicity, let's just test the domain risk function first
            if "typosquatting" in reason:
                print(f"  ✅ Typo-squatting correctly detected for {url}")
            elif url == "https://www.google.com" and reason == "exact_domain_match":
                print(f"  ✅ Exact match correctly detected for {url}")
            else:
                print(f"  ❌ Unexpected reason: {reason}")
        except Exception as e:
            print(f"  ❌ Prediction failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_typo_squatting())
