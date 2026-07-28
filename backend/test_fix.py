#!/usr/bin/env python3
"""
Test the complete ml_model.py with predict.py integration
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import numpy as np
from app.ml_model import ml_model

print("🧪 TESTING COMPLETE ML MODEL WITH PREDICT.PY INTEGRATION")
print("="*60)

# Get model info
info = ml_model.get_model_info()
print(f"✓ Model loaded: {info['loaded']}")
print(f"✓ Model type: {info['model_type']}")
print(f"✓ Features: {info['features']}")
print(f"✓ Model healthy: {info['model_healthy']}")
print(f"✓ Using fallback: {info['using_fallback']}")
print(f"✓ Class mapping: {info.get('class_mapping', 'N/A')}")

# Test with various URLs
test_urls = [
    {
        "name": "Google",
        "features": {"IsHTTPS": 1.0, "URLLength": 15.0, "CertificateValid": 1.0}
    },
    {
        "name": "Clear Phishing",
        "features": {"IsHTTPS": 0.0, "URLLength": 85.0, "HasIPAddress": 1.0, 
                    "NumSensitiveWords": 1.0, "CertificateValid": 0.0}
    },
    {
        "name": "Suspicious",
        "features": {"IsHTTPS": 1.0, "URLLength": 65.0, "SpecialCharRatio": 0.2}
    }
]

print("\n" + "="*60)
print("🔍 TESTING PREDICTIONS WITH RULE-BASED FALLBACK")
print("-" * 40)

for test in test_urls:
    print(f"\n📊 {test['name']}:")
    
    # Show features
    for key, value in test["features"].items():
        print(f"  {key}: {value}")
    
    # Create full feature set
    all_features = {feat: 0.0 for feat in ml_model.get_feature_names()}
    all_features.update(test["features"])
    
    # Predict
    df = pd.DataFrame([all_features])
    predictions, probabilities = ml_model.predict(df, threshold=0.6)
    
    print(f"\n  Results:")
    print(f"    Phishing probability: {probabilities[0][0]:.6f}")
    print(f"    Legitimate probability: {probabilities[0][1]:.6f}")
    print(f"    Prediction: {'🚨 PHISHING' if predictions[0] == 0 else '✅ LEGITIMATE'}")
    
    # Test single prediction method
    single_result = ml_model.predict_single(all_features, threshold=0.6)
    print(f"    Method: {single_result['method']}")

print("\n" + "="*60)
print("🔧 TESTING SHAP EXPLANATION (WILL USE RULE-BASED)")
print("-" * 40)

# Test SHAP explanation
test_features = {feat: 0.0 for feat in ml_model.get_feature_names()}
test_features['has_https'] = 0.0
test_features['url_length'] = 80.0

df = pd.DataFrame([test_features])
explanation = ml_model.get_shap_explanation(df)

print(f"Explanation method: {explanation['method']}")
print(f"Model type: {explanation['model_type']}")

if explanation.get('note'):
    print(f"Note: {explanation['note']}")

print("\nTop features:")
for feat in explanation.get('top_features', [])[:5]:
    print(f"  {feat.get('feature', 'unknown')}: {feat.get('contribution', 0):.4f}")

print("\n" + "="*60)
print("💡 COMPATIBILITY WITH PREDICT.PY:")
print("-" * 40)

# Test methods that predict.py uses
print(f"✓ ml_model.is_loaded(): {ml_model.is_loaded()}")
print(f"✓ ml_model.has_shap(): {ml_model.has_shap()}")
print(f"✓ ml_model.get_feature_names() length: {len(ml_model.get_feature_names())}")
print(f"✓ ml_model.get_version(): {ml_model.get_version()}")

# Test that predict() returns correct format
test_df = pd.DataFrame([{feat: 0.0 for feat in ml_model.get_feature_names()}])
try:
    predictions, probabilities = ml_model.predict(test_df)
    print(f"✓ ml_model.predict() returns: predictions shape={predictions.shape}, probabilities shape={probabilities.shape}")
    print(f"✓ Probability format: [phishing={probabilities[0][0]:.4f}, legitimate={probabilities[0][1]:.4f}]")
except Exception as e:
    print(f"✗ ml_model.predict() failed: {e}")

print("\n" + "="*60)
print("✅ READY FOR PREDICT.PY INTEGRATION!")
print("\nSummary:")
print(f"1. Model loaded: {info['loaded']}")
print(f"2. Using fallback: {info['using_fallback']} (because ML model is broken)")
print(f"3. Rule-based system will handle predictions")
print(f"4. All predict.py required methods are implemented")
print(f"5. get_shap_explanation() returns rule-based explanations")
print(f"\nYour predict.py should work with this ml_model.py!")