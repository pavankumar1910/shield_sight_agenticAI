import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import logging
from pathlib import Path

# Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Trainer")

MODELS_DIR = Path("models")
MODEL_PATH = MODELS_DIR / "production_xgboost_compatible.pkl"
FEATURE_PATH = MODELS_DIR / "feature_names_compatible.pkl"

logger.info("🤖 Starting Quick Retraining (Option B)...")

# 1. Define Features (Must match what app expects)
# We load existing feature names to ensure compatibility
with open(FEATURE_PATH, 'rb') as f:
    feature_names = pickle.load(f)

logger.info(f"Targeting {len(feature_names)} features: {feature_names}")

# 2. Create Synthetic Training Data (Smart patterns)
# We create "archetypes" of phishing and legitimate sites
data = []
labels = []

def add_sample(is_phishing: bool, **kwargs):
    row = {f: 0.0 for f in feature_names}
    
    # Defaults
    if not is_phishing:
        row['IsHTTPS'] = 1.0
        row['URLLength'] = 25.0
        row['DomainLength'] = 10.0
    else:
        row['IsHTTPS'] = 0.0
        row['URLLength'] = 65.0
        row['DomainLength'] = 25.0
        row['SuspiciousTLD'] = 1.0
        
    # Overrides
    for k, v in kwargs.items():
        if k in row:
            row[k] = v
            
    # CRITICAL FIX: Ensure values are in exact order of feature_names
    data.append([row[f] for f in feature_names])
    labels.append(0 if is_phishing else 1) # 0=Phishing, 1=Legitimate

# -- Legitimate Samples --
for _ in range(500):
    # Standard Google/FB style
    add_sample(False, URLLength=20+np.random.randint(10), IsHTTPS=1.0)
    # Long legitimate blog post
    add_sample(False, URLLength=60+np.random.randint(20), IsHTTPS=1.0, NumDots=2)

# -- Phishing Samples --
for _ in range(500):
    # Standard sketchy TLD
    add_sample(True, HasSuspiciousTLD=1.0, IsHTTPS=0.0)
    # IP Address
    add_sample(True, HasIPAddress=1.0, IsHTTPS=0.0)
    # Typosquatting (simulated by features)
    add_sample(True, URLLength=50+np.random.randint(30), NumSensitiveWords=1.0)
    # "Secure" in URL but no HTTPS
    add_sample(True, NumSensitiveWords=1.0, IsHTTPS=0.0)

X = pd.DataFrame(data, columns=feature_names)
y = np.array(labels)

logger.info(f"Training on {len(X)} samples...")

# 3. Train Model
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
model.fit(X, y)

# 4. Save
logger.info(f"Saving to {MODEL_PATH}...")
with open(MODEL_PATH, 'wb') as f:
    pickle.dump(model, f)

logger.info("✅ Model retrained and saved successfully!")
