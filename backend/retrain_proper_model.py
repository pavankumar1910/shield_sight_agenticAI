# backend/retrain_proper_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
import pickle
import os
import time
from app.utils.feature_extraction import extract_features
from sklearn.metrics import accuracy_score, classification_report

print("🔄 Retraining PROPER model with correct labels...")
print("=" * 60)

# ---------------------------------------------------------
# STEP 1: Create a BETTER training dataset
# ---------------------------------------------------------
print("\n📊 Creating balanced training dataset...")

# We'll create synthetic legitimate features for known good sites
legitimate_examples = [
    "https://google.com",
    "https://github.com",
    "https://facebook.com",
    "https://amazon.com",
    "https://microsoft.com",
    "https://apple.com",
    "https://netflix.com",
    "https://youtube.com",
    "https://twitter.com",
    "https://instagram.com",
    "https://linkedin.com",
    "https://wikipedia.org",
    "https://stackoverflow.com",
    "https://reddit.com",
    "https://paypal.com",
    "https://ebay.com",
    "https://walmart.com",
    "https://target.com",
    "https://cnn.com",
    "https://bbc.com"
]

# Load some phishing URLs from your dataset
print("Loading phishing URLs...")
phishing_df = pd.read_csv('../data/raw/phiusiil_dataset.csv')
phishing_df = phishing_df[phishing_df['label'] == 1]
phishing_urls = phishing_df['URL'].head(100).tolist()  # Take 100 phishing URLs

print(f"Legitimate examples: {len(legitimate_examples)}")
print(f"Phishing examples: {len(phishing_urls)}")

# ---------------------------------------------------------
# STEP 2: Extract features
# ---------------------------------------------------------
print("\n🔧 Extracting features...")

all_features = []
all_labels = []

# Extract features for legitimate sites
print("Processing legitimate sites...")
for url in legitimate_examples:
    try:
        features = extract_features(url)
        all_features.append(features)
        all_labels.append(1)  # 1 = legitimate
        print(f"  ✓ {url}")
    except Exception as e:
        print(f"  ✗ {url}: {e}")

# Extract features for phishing sites
print("\nProcessing phishing sites...")
for url in phishing_urls:
    try:
        features = extract_features(url)
        all_features.append(features)
        all_labels.append(0)  # 0 = phishing
        print(f"  ✓ {url[:50]}...")
    except Exception as e:
        print(f"  ✗ Error: {e}")
        continue

print(f"\n✅ Total samples: {len(all_features)}")
print(f"   Legitimate: {sum(all_labels)}")
print(f"   Phishing: {len(all_labels) - sum(all_labels)}")

# ---------------------------------------------------------
# STEP 3: Prepare dataset
# ---------------------------------------------------------
print("\n📋 Preparing dataset...")
df = pd.DataFrame(all_features)
df['label'] = all_labels

# Check for NaN values
df = df.fillna(0)

print(f"Dataset shape: {df.shape}")
print(f"Features: {len(df.columns) - 1}")

# ---------------------------------------------------------
# STEP 4: Train model
# ---------------------------------------------------------
print("\n🤖 Training XGBoost model...")

X = df.drop('label', axis=1)
y = df['label']

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training: {X_train.shape}")
print(f"Testing: {X_test.shape}")

# Train
model = XGBClassifier(
    n_estimators=150,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
    eval_metric='logloss'
)

start_time = time.time()
model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=False
)
training_time = time.time() - start_time

print(f"Training time: {training_time:.1f}s")

# ---------------------------------------------------------
# STEP 5: Evaluate
# ---------------------------------------------------------
print("\n📊 Evaluating model...")

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"Accuracy: {accuracy:.4f}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Phishing', 'Legitimate']))

# ---------------------------------------------------------
# STEP 6: Test with known sites
# ---------------------------------------------------------
print("\n🧪 Testing with known sites...")

test_cases = [
    ("https://google.com", "Google", "legitimate"),
    ("https://github.com", "GitHub", "legitimate"),
    ("https://login-verify-account.bad-site.tk", "Suspicious", "phishing"),
    ("https://paypal.com", "PayPal", "legitimate"),
    ("http://secure-banking-update.fake-site.ga", "Fake bank", "phishing"),
]

for url, name, expected in test_cases:
    try:
        features = extract_features(url)
        features_df = pd.DataFrame([features])
        
        # Ensure all columns exist
        for col in X_train.columns:
            if col not in features_df.columns:
                features_df[col] = 0
        
        features_df = features_df[X_train.columns]
        
        prediction = model.predict(features_df)[0]
        probability = model.predict_proba(features_df)[0]
        
        result = "✅ CORRECT" if (prediction == 0 and expected == "phishing") or (prediction == 1 and expected == "legitimate") else "❌ WRONG"
        
        print(f"  {name:15} → {'LEGIT' if prediction == 1 else 'PHISH'} "
              f"(prob: {probability[1]:.3f}) {result}")
        
    except Exception as e:
        print(f"  {name:15} → ERROR: {e}")

# ---------------------------------------------------------
# STEP 7: Save model
# ---------------------------------------------------------
print("\n💾 Saving model...")
os.makedirs('models', exist_ok=True)

model_path = 'models/production_xgboost_fixed.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

feature_path = 'models/feature_names_fixed.pkl'
with open(feature_path, 'wb') as f:
    pickle.dump(X_train.columns.tolist(), f)

print(f"✅ Model saved: {model_path}")
print(f"✅ Features saved: {feature_path}")
print(f"✅ Total features: {len(X_train.columns)}")

# ---------------------------------------------------------
# STEP 8: Create a simple test
# ---------------------------------------------------------
print("\n" + "=" * 60)
print("🎉 Model training complete!")
print(f"   Accuracy: {accuracy:.1%}")
print(f"   Features: {len(X_train.columns)}")
print(f"   Samples: {len(df)}")
print("=" * 60)

# Quick verification
print("\n🔍 Final verification with Google:")
google_features = extract_features("https://google.com")
google_df = pd.DataFrame([google_features])
for col in X_train.columns:
    if col not in google_df.columns:
        google_df[col] = 0
google_df = google_df[X_train.columns]

pred = model.predict(google_df)[0]
prob = model.predict_proba(google_df)[0]
print(f"   Prediction: {'LEGITIMATE ✅' if pred == 1 else 'PHISHING ❌'}")
print(f"   Probability: phishing={prob[0]:.4f}, legitimate={prob[1]:.4f}")