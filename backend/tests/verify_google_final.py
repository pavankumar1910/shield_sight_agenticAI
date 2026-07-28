import sys
import os
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.ml_model import ml_model
from app.utils.feature_extraction import feature_extractor
from app.routes.predict import analyze_domain_risk

def check_google():
    url = "https://www.google.com"
    print(f"\n⚡ Verifying: {url}")
    
    # 1. Whitelist Check
    is_whitelisted, reason, boost = analyze_domain_risk(url)
    print(f"   Domain Risk Analysis: Whitelisted? {is_whitelisted} ({reason})")
    
    # 2. ML Score
    features_df = feature_extractor.extract_with_defaults(url, ml_model.get_feature_names())
    predictions, probabilities = ml_model.predict(features_df)
    phishing_prob = float(probabilities[0][0])
    
    print(f"   Raw Phishing Score: {phishing_prob:.4f}")
    
    # 3. Final Decision Logic
    final_prediction = "LEGITIMATE"
    if is_whitelisted and boost > 0.2:
        if phishing_prob > 0.95: 
            final_prediction = "PHISHING (Override)"
        else:
            final_prediction = "LEGITIMATE (Trusted)"
            
    print(f"   FINAL DECISION: {final_prediction}")
    
    if final_prediction.startswith("LEGITIMATE"):
        print("\n✅ RESULT: PERFECT. Google is correctly identified as Safe.")
    else:
        print("\n❌ RESULT: FAILED. Google is marked as Phishing.")

if __name__ == "__main__":
    check_google()
