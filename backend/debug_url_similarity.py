# debug_url_similarity.py
import pandas as pd
import numpy as np

print("🔍 Investigating URLSimilarityIndex...")

# Load original dataset
original = pd.read_csv('../data/raw/phiusiil_dataset.csv')

# Check statistics of URLSimilarityIndex for each class
print("\n📊 URLSimilarityIndex Statistics by Class:")
print("Phishing sites (label=1):")
print(original[original['label'] == 1]['URLSimilarityIndex'].describe())
print("\nLegitimate sites (label=0):")
print(original[original['label'] == 0]['URLSimilarityIndex'].describe())

# Check if it perfectly separates classes
print("\n🧪 Does URLSimilarityIndex perfectly separate classes?")
phishing_values = original[original['label'] == 1]['URLSimilarityIndex'].values
legit_values = original[original['label'] == 0]['URLSimilarityIndex'].values

# Check for overlap
overlap_min = max(phishing_values.min(), legit_values.min())
overlap_max = min(phishing_values.max(), legit_values.max())

if overlap_min <= overlap_max:
    print(f"✅ There IS overlap between classes: {overlap_min} to {overlap_max}")
    print(f"   This feature alone shouldn't give 100% accuracy")
else:
    print(f"🚨 NO OVERLAP between classes!")
    print(f"   Phishing range: {phishing_values.min()} to {phishing_values.max()}")
    print(f"   Legitimate range: {legit_values.min()} to {legit_values.max()}")
    print(f"   This feature ALONE can give 100% accuracy!")