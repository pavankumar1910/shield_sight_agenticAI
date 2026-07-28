"""
Test feature extraction
"""

from app.utils.feature_extraction import feature_extractor
from app.ml_model import ml_model

print("Testing Feature Extraction...")
print("=" * 60)

# Test URLs
test_urls = [
    "http://paypal-secure.com/login",
    "https://www.google.com",
    "http://192.168.1.1/admin"
]

feature_names = ml_model.get_feature_names()

for url in test_urls:
    print(f"\nURL: {url}")
    print("-" * 60)
    
    # Extract features
    features_dict = feature_extractor.extract_features(url)
    
    print(f"Extracted {len(features_dict)} features:")
    for key, value in list(features_dict.items())[:10]:  # Show first 10
        print(f"  {key}: {value}")
    
    # Test with full feature set
    features_df = feature_extractor.extract_with_defaults(url, feature_names)
    print(f"\nFull feature DataFrame shape: {features_df.shape}")
    
    # Make prediction
    predictions, probabilities = ml_model.predict(features_df)
    print(f"\nPrediction: {'Phishing' if predictions[0] == 0 else 'Legitimate'}")
    print(f"Confidence: {probabilities[0][predictions[0]]:.2%}")

print("\n" + "=" * 60)
print("✅ Feature extraction working!")