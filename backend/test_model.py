import pickle
import numpy as np
import pandas as pd
from pathlib import Path

# Path adjustment for correct loading
model_path = Path('models/production_xgboost_compatible.pkl')
feature_path = Path('models/feature_names_compatible.pkl')

print(f"Loading model from: {model_path}")

try:
    # Load model
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    # Load feature names
    with open(feature_path, 'rb') as f:
        feature_names = pickle.load(f)

    print(f"Model type: {type(model)}")
    print(f"Features: {len(feature_names)}")

    # Test with different inputs
    test_cases = [
        np.zeros(len(feature_names)),  # All zeros
        np.ones(len(feature_names)),   # All ones
        np.random.random(len(feature_names)),  # Random
    ]

    print("\n🧪 Testing model predictions:")
    for i, test_input in enumerate(test_cases):
        df = pd.DataFrame([test_input], columns=feature_names)
        try:
            # Handle XGBoost specific adjustments if needed
            if not hasattr(model, 'use_label_encoder'):
                model.use_label_encoder = False
            
            pred = model.predict(df)
            proba = model.predict_proba(df)
            print(f"Test {i+1}: Pred={pred[0]}, Proba={proba[0]}")
        except Exception as e:
            print(f"Test {i+1}: ERROR - {e}")

    # Check if predictions are constant
    probas = []
    print("\n📊 Checking variance in predictions (10 random samples):")
    for _ in range(10):
        test = np.random.random(len(feature_names))
        df = pd.DataFrame([test], columns=feature_names)
        try:
            proba = model.predict_proba(df)[0][0]
            probas.append(proba)
        except:
            pass

    if probas:
        variance = np.var(probas)
        print(f"Variance in predictions: {variance:.6f}")
        if variance < 0.001:
            print("❌ MODEL IS BROKEN - Constant predictions!")
        else:
            print("✅ Model seems OK")
    else:
        print("Could not run variance test.")

except Exception as e:
    print(f"Failed to load or test model: {e}")
