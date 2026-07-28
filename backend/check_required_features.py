# backend/test_fixed_model.py
import sys
sys.path.append('.')
from app.ml_model import ml_model
from app.utils.feature_extraction import extract_features
import pandas as pd

print("🧪 Testing fixed model...")

# Load the compatible model
ml_model.reload(enhanced=True)  # Will load compatible if enhanced=True points to it

# Or load directly
ml_model.load_model(enhanced=True)  # Make sure this loads the compatible model

if ml_model.is_loaded():
    print(f"✅ Model loaded: {ml_model._model_type}")
    
    # Test URLs
    test_urls = [
        ("https://google.com", "Google"),
        ("https://github.com", "GitHub"),
        ("http://login-secure-verify.bad-site.tk", "Suspicious"),
        ("https://paypal.com", "PayPal"),
    ]
    
    for url, name in test_urls:
        print(f"\n📡 Testing {name}: {url}")
        
        # Extract features
        features = extract_features(url)
        feature_names = ml_model.get_feature_names()
        
        # Create DataFrame
        features_df = pd.DataFrame([{col: features.get(col, 0) for col in feature_names}])
        
        try:
            predictions, probabilities = ml_model.predict(features_df)
            
            # Determine prediction
            pred_class = predictions[0]
            prob_array = probabilities[0]
            
            # Assuming 0=phishing, 1=legitimate
            if len(prob_array) == 2:
                phishing_prob = prob_array[0]
                legitimate_prob = prob_array[1]
                
                print(f"  Phishing prob: {phishing_prob:.4f}")
                print(f"  Legitimate prob: {legitimate_prob:.4f}")
                print(f"  Prediction: {'🚨 PHISHING' if pred_class == 0 else '✅ LEGITIMATE'}")
                print(f"  Confidence: {max(phishing_prob, legitimate_prob):.1%}")
            else:
                print(f"  Error: Unexpected probability shape {prob_array.shape}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
else:
    print("❌ Model not loaded")