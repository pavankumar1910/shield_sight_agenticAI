from ucimlrepo import fetch_ucirepo 
import pandas as pd
import os

# Create data directories
os.makedirs('data/raw', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)

# Fetch dataset 
print("Downloading UCI Phishing Websites Dataset...")
phishing_websites = fetch_ucirepo(id=327) 

# Get data
X = phishing_websites.data.features 
y = phishing_websites.data.targets

# Combine
data = pd.concat([X, y], axis=1)

# Save
data.to_csv('data/raw/phishing_dataset.csv', index=False)

print(f"✅ Dataset downloaded successfully!")
print(f"Shape: {data.shape}")
print(f"Saved to: data/raw/phishing_dataset.csv")
print(f"\nFirst 5 rows:")
print(data.head())
print(f"\nColumn names:")
print(data.columns.tolist())