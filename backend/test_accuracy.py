import sys
import os
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.ERROR)

# Add backend to path
sys.path.append(os.getcwd())

from app.ml_model import ml_model
from app.utils.feature_extraction import feature_extractor

print("🧪 Running Accuracy Sanity Check on 'Enhanced' Model...")

if not ml_model.is_loaded():
    print("❌ Model not loaded!")
    sys.exit(1)

test_cases = [
    ("https://www.google.com", "legitimate"),
    ("https://github.com", "legitimate"),
    ("http://paypal-secure-update.tk", "phishing"),
    ("http://verify-login-apple.com.badsite.org", "phishing")
]

passed = 0
for url, expected in test_cases:
    try:
        # Extract features
        feature_names = ml_model.get_feature_names()
        features_df = feature_extractor.extract_with_defaults(url, feature_names)
        
        # Predict
        prediction, probs = ml_model.predict(features_df)
        
        # 0 = Phishing, 1 = Legitimate (based on standard mapping)
        result = "legitimate" if prediction[0] == 1 else "phishing"
        
        is_correct = result == expected
        icon = "✅" if is_correct else "❌"
        
        print(f"{icon} URL: {url}")
        print(f"   Expected: {expected}, Got: {result}")
        
        if is_correct:
            passed += 1
            
    except Exception as e:
        print(f"❌ Error testing {url}: {e}")

print(f"\nResult: {passed}/{len(test_cases)} Passed")

if passed == len(test_cases):
    print("✨ COMPLETE SUCCESS: Model is accurate.")
else:
    print("⚠️ WARNING: Model has potential accuracy issues.")
