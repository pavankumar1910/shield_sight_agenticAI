import pandas as pd
import numpy as np
from app.utils.feature_extraction import extract_features
from tqdm import tqdm
import pickle

# Load Alexa/Tranco data
alexa_df = pd.read_csv('../data/raw/top-1m.csv', header=None, names=['rank', 'domain'])

# Take top 20,000 domains
top_domains = alexa_df.head(20000)['domain'].tolist()

# Convert to URLs
legitimate_urls = [f"https://{domain}" for domain in top_domains]

print(f"Extracting features from {len(legitimate_urls)} legitimate URLs...")

# Extract features
legitimate_features = []
for url in tqdm(legitimate_urls):
    try:
        features = extract_features(url)
        legitimate_features.append(features)
    except:
        pass

# Create DataFrame
legitimate_df = pd.DataFrame(legitimate_features)
legitimate_df['label'] = 0  # 0 = legitimate

# Save
legitimate_df.to_csv('alexa_legitimate_features.csv', index=False)
print(f"✅ Extracted {len(legitimate_df)} legitimate samples")