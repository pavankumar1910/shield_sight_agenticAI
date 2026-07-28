# backend/test_model_loading.py
import sys
sys.path.append('.')
from app.ml_model import ml_model

print("🧪 Testing ML Model...")

# Force reload
print("🔄 Loading model...")
success = ml_model.reload(enhanced=True)

if success:
    print(f"✅ Model loaded successfully!")
    print(f"   Type: {ml_model._model_type}")
    print(f"   Features: {len(ml_model.get_feature_names())}")
    print(f"   Is loaded: {ml_model.is_loaded()}")
    
    # Test feature extraction
    from app.utils.feature_extraction import extract_features
    features = extract_features("https://google.com")
    print(f"   Extracted features: {len(features)}")
    
    # Test prediction
    import pandas as pd
    feature_names = ml_model.get_feature_names()
    features_df = pd.DataFrame([{k: features.get(k, 0) for k in feature_names}])
    
    try:
        predictions, probabilities = ml_model.predict(features_df)
        print(f"   Prediction: {'phishing' if predictions[0] == 0 else 'legitimate'}")
        print(f"   Probability: {probabilities[0]}")
        print("🎉 ML Model is fully functional!")
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
else:
    print("❌ Failed to load model")
    print("Check if these files exist:")
    print("  backend/models/production_xgboost_enhanced.pkl")
    print("  backend/models/feature_names_phiusiil.pkl")