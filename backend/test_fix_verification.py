import sys
import os
import numpy as np
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Add backend to path
sys.path.append(os.getcwd())

from app.ml_model import ml_model

print(f"Model loaded: {ml_model.is_loaded()}")
print(f"Model type: {ml_model._model_type}")

if ml_model.is_loaded():
    try:
        feature_names = ml_model.get_feature_names()
        print(f"Feature count: {len(feature_names)}")
        
        # Test variance
        probas = []
        print("\nTesting variance:")
        for _ in range(10):
            # Create random features
            feats = {f: np.random.random() for f in feature_names}
            df = pd.DataFrame([feats])
            _, proba = ml_model.predict(df)
            probas.append(proba[0][0])
            
        var = np.var(probas)
        print(f"Variance: {var:.6f}")
        
        if var > 0.001:
            print("✅ PASS: Model variance is healthy.")
        else:
            print("❌ FAIL: Model variance is too low (broken).")
    except Exception as e:
        print(f"❌ FAIL: Exception during testing: {e}")
else:
    print("❌ FAIL: Model not loaded.")
