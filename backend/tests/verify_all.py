import sys
import os
import pandas as pd
import logging

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ml_model import ml_model
from app.utils.feature_extraction import feature_extractor
from app.routes.predict import analyze_domain_risk

# Configure logging
logging.basicConfig(level=logging.ERROR)

def verify_all():
    print("\n=============================================")
    print("PHISHING DETECTION VERIFICATION SUITE")
    print("=============================================\n")
    
    test_cases = [
        # LEGITIMATE SITES
        {
            "url": "https://www.google.com",
            "expected_type": "LEGITIMATE",
            "desc": "High Trust / Whitelisted"
        },
        {
            "url": "https://www.paypal.com",
            "expected_type": "LEGITIMATE",
            "desc": "High Trust / Whitelisted"
        },
        {
            "url": "https://github.com",
            "expected_type": "LEGITIMATE",
            "desc": "Trusted Domain"
        },
        
        # PHISHING SITES (Simulated based on structure)
        {
            "url": "http://banking-verify.tk", 
            "expected_type": "PHISHING", 
            "desc": "Suspicious TLD + HTTP + Keywords"
        },
        {
            "url": "http://paypal-secure-login.com", 
            "expected_type": "PHISHING", 
            "desc": "Typosquatting + HTTP + Keywords"
        },
        {
             "url": "http://192.168.1.1/login",
             "expected_type": "PHISHING",
             "desc": "IP Address + HTTP + Keywords"
        }
    ]
    
    passed_count = 0
    with open("verification_results.log", "w", encoding="utf-8") as f:
        f.write("PHISHING DETECTION VERIFICATION SUITE\n")
        f.write("=============================================\n\n")
        
        for case in test_cases:
            url = case['url']
            expected = case['expected_type']
            
            f.write(f"Testing: {url} ({case['desc']})\n")
            
            # 1. Domain Analysis (Whitelist Check)
            is_whitelisted, reason, boost = analyze_domain_risk(url)
            
            # 2. Extract Features
            feature_names = ml_model.get_feature_names()
            features_df = feature_extractor.extract_with_defaults(url, feature_names)
            
            # 3. ML/Rule-Based Prediction
            predictions, probabilities = ml_model.predict(features_df)
            
            phishing_prob = float(probabilities[0][0])
            legit_prob = float(probabilities[0][1])
            prediction_raw = "PHISHING" if predictions[0] == 0 else "LEGITIMATE"
            
            # 4. Apply Override Logic (Mimic predict.py logic)
            final_prediction = prediction_raw
            final_conf = max(phishing_prob, legit_prob)
            
            if is_whitelisted and boost > 0.2:
                if legit_prob < 0.05 and phishing_prob > 0.95:
                     final_prediction = "PHISHING" # Override
                     f.write("  -> WhiteList OVERRIDDEN by Strong ML Signal\n")
                else:
                     final_prediction = "LEGITIMATE" # Trust Whitelist
                     f.write("  -> Trusted by Whitelist\n")
            
            f.write(f"  -> Score: {phishing_prob:.4f}\n")
            f.write(f"  -> Result: {final_prediction}\n")
            
            if final_prediction == expected:
                f.write("  ✅ PASS\n")
                passed_count += 1
            else:
                f.write(f"  ❌ FAIL (Expected {expected}, Got {final_prediction})\n")
            f.write("-" * 30 + "\n")
            
        f.write(f"\nFinal Results: {passed_count}/{len(test_cases)} Passed\n")
        print(f"Verification complete. Results written to verification_results.log")

if __name__ == "__main__":
    verify_all()
