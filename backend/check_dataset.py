# check_dataset.py
import pandas as pd
import numpy as np

print("📊 Checking original dataset structure...")
original_df = pd.read_csv('../data/raw/phiusiil_dataset.csv', nrows=5)

print(f"Shape: {original_df.shape}")
print(f"\nColumn dtypes:")
print(original_df.dtypes.head(20))

print(f"\nFirst few columns:")
print(original_df.columns[:15].tolist())

print(f"\nSample data (first row):")
print(original_df.iloc[0].head(15))

# Count numeric vs non-numeric columns
numeric_cols = original_df.select_dtypes(include=[np.number]).columns.tolist()
non_numeric_cols = original_df.select_dtypes(exclude=[np.number]).columns.tolist()

print(f"\n📈 Summary:")
print(f"Total columns: {len(original_df.columns)}")
print(f"Numeric columns: {len(numeric_cols)}")
print(f"Non-numeric columns: {len(non_numeric_cols)}")
print(f"Non-numeric columns: {non_numeric_cols[:10]}")