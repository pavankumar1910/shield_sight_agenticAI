import sys
import os
import asyncio
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), 'backend')))

from app.routes.predict import predict_single_url
from app.ml_model import ml_model

async def test_leecode():
    print("Loading model...")
    ml_model.load_model(mode="compatible")
    
    url = "https://www.leecode.com"
    print(f"\nAnalyzing {url}...")
    
    # We want to see if typo-squatting is detected now that leetcode.com is in HIGH_TRUST_DOMAINS
    # And if 405 status code leads to a downgrade if it were predicted legitimate.
    
    response = await predict_single_url(url, include_explanation=False)
    
    print(f"Prediction: {response.prediction}")
    print(f"Confidence: {response.confidence}")
    print(f"Risk Level: {response.risk_level}")
    # Remove emojis for console output to avoid encoding errors
    safe_summary = response.summary.encode('ascii', 'ignore').decode('ascii')
    print(f"Summary: {safe_summary}")
    print(f"Domain Analysis: {response.metadata['domain_analysis']}")
    
    if "typosquatting_detected" in response.metadata['domain_analysis']:
        print("✅ Typo-squatting correctly detected!")
    else:
        print("❌ Typo-squatting NOT detected.")

    if response.prediction == 'phishing' or response.risk_level in ['caution', 'warning', 'medium', 'high', 'critical']:
        print("✅ Risk level is appropriately elevated.")
    else:
        print("❌ Risk level is still too low.")

if __name__ == "__main__":
    asyncio.run(test_leecode())
