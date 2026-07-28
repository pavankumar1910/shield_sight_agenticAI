# quick_check.py
import pandas as pd

# Check the Alexa features file
print("🔍 Checking alexa_legitimate_features.csv...")
alexa = pd.read_csv('../data/raw/alexa_legitimate_features.csv')
print(f"Shape: {alexa.shape}")
print(f"Columns: {alexa.columns.tolist()[:10]}...")
print(f"Has 'label' column? {'label' in alexa.columns}")

# If 'label' is in columns, it shouldn't be
if 'label' in alexa.columns:
    print("❌ ERROR: 'label' is in the features! Removing it...")
    
    # Save just the features (without label)
    features = alexa.drop(columns=['label'])
    features.to_csv('../data/raw/alexa_legitimate_features.csv', index=False)
    
    # Save labels separately
    labels = alexa[['label']]
    labels.to_csv('../data/raw/alexa_labels.csv', index=False)
    
    print(f"✅ Fixed! Features shape: {features.shape}")
    print(f"✅ Labels saved separately")
else:
    print("✅ 'label' is not in features (correct)")