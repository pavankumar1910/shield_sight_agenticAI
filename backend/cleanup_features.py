# cleanup_features.py
import pandas as pd
import numpy as np

# Load the existing Alexa features
alexa_df = pd.read_csv('../data/raw/alexa_legitimate_features.csv')

# Keep only numeric columns
numeric_cols = alexa_df.select_dtypes(include=[np.number]).columns.tolist()
print(f"Original columns: {len(alexa_df.columns)}")
print(f"Numeric columns: {len(numeric_cols)}")

# Remove string columns
string_cols = ['FILENAME', 'URL', 'Domain', 'TLD', 'Title']
for col in string_cols:
    if col in alexa_df.columns:
        print(f"Removing string column: {col}")
        alexa_df = alexa_df.drop(columns=[col])

# Ensure label column exists
if 'label' not in numeric_cols:
    alexa_df['label'] = 0

# Save cleaned version
alexa_df.to_csv('../data/raw/alexa_legitimate_features.csv', index=False)
print("✅ Cleaned and saved!")