# backend/debug_features.py
import sys
sys.path.append('.')
from app.ml_model import ml_model
from app.utils.feature_extraction import extract_features
import pandas as pd

print("🔍 Debugging Feature Extraction...")

# Load model
print("🔄 Loading ML model...")
success = ml_model.reload(enhanced=True)
print(f"Model loaded: {success}")
print(f"Is loaded: {ml_model.is_loaded()}")

if ml_model.is_loaded():
    feature_names = ml_model.get_feature_names()
    print(f"\n✅ Model expects {len(feature_names)} features")
    print(f"First 10: {feature_names[:10]}")
    
    # Test URL
    test_url = "https://google.com"
    print(f"\n📡 Testing URL: {test_url}")
    
    # Extract features
    features = extract_features(test_url)
    print(f"✅ Extracted {len(features)} features")
    
    # Show sample features
    print(f"\n📊 Sample extracted features:")
    sample_keys = list(features.keys())[:15]
    for key in sample_keys:
        print(f"  {key}: {features[key]}")
    
    # Check feature alignment
    missing_features = [f for f in feature_names if f not in features]
    extra_features = [f for f in features if f not in feature_names]
    
    print(f"\n🔍 Feature Alignment:")
    print(f"Missing in extraction: {len(missing_features)}")
    if missing_features:
        print(f"  Example missing: {missing_features[:5]}")
    print(f"Extra in extraction: {len(extra_features)}")
    if extra_features:
        print(f"  Example extra: {extra_features[:5]}")
    
    # Create DataFrame for prediction
    print(f"\n🔄 Creating DataFrame for prediction...")
    features_df = pd.DataFrame([{k: features.get(k, 0) for k in feature_names}])
    print(f"DataFrame shape: {features_df.shape}")
    print(f"Columns: {list(features_df.columns[:10])}...")
    
    # Test prediction
    try:
        print(f"\n🤖 Making prediction...")
        predictions, probabilities = ml_model.predict(features_df)
        pred_class = predictions[0]
        prob_array = probabilities[0]
        
        print(f"✅ Prediction successful!")
        print(f"  Raw prediction: {pred_class}")
        print(f"  Class: {'phishing' if pred_class == 0 else 'legitimate'}")
        print(f"  Probabilities: phishing={prob_array[0]:.6f}, legitimate={prob_array[1]:.6f}")
        
        # Domain analysis
        from urllib.parse import urlparse
        parsed = urlparse(test_url)
        domain = parsed.netloc
        print(f"\n🌐 Domain analysis:")
        print(f"  Domain: {domain}")
        print(f"  Is HTTPS: {'Yes' if parsed.scheme == 'https' else 'No'}")
        
    except Exception as e:
        print(f"❌ Prediction error: {type(e).__name__}: {e}")
        
else:
    print("❌ Model failed to load!")
    print("Check these files exist:")
    print("  backend/models/production_xgboost_enhanced.pkl")
    print("  backend/models/feature_names_phiusiil.pkl")
    
print("\n" + "=" * 60)
print("Debug complete!")