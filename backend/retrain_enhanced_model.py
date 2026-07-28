"""
CORRECTED: Retraining without data leakage features
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
import pickle
import os
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def analyze_features(df, label_col='label'):
    """Analyze features for data leakage"""
    suspicious_features = []
    
    for column in df.columns:
        if column == label_col:
            continue
            
        # Check if feature perfectly predicts one class
        unique_values = df[column].nunique()
        
        if unique_values < 10:  # Low cardinality features
            for value in df[column].unique():
                subset = df[df[column] == value]
                if len(subset) > 0:
                    class_dist = subset[label_col].value_counts(normalize=True)
                    # If 95%+ of samples with this value are one class
                    if len(class_dist) == 1 or class_dist.max() > 0.95:
                        suspicious_features.append(column)
                        print(f"⚠️  Suspicious: {column}={value} -> {class_dist.idxmax()} class ({class_dist.max():.1%})")
                        break
    
    return list(set(suspicious_features))

def realistic_retrain():
    print("🚀 Starting REALISTIC enhanced model training...\n")
    
    # Load datasets
    print("📂 Loading datasets...")
    original = pd.read_csv('../data/raw/phiusiil_dataset.csv')
    alexa = pd.read_csv('../data/raw/alexa_legitimate_features.csv')
    
    print(f"Original: {original.shape}, Alexa: {alexa.shape}")
    
    # Analyze for data leakage
    print("\n🔍 Analyzing for data leakage...")
    suspicious_original = analyze_features(original)
    print(f"Found {len(suspicious_original)} suspicious features in original dataset")
    
    # KNOWN problematic features (from our analysis)
    known_problematic = [
        'URLSimilarityIndex',  # ALL phishing = 100, major leakage!
        'TLDLegitimateProb',   # Might also be problematic
        'URLCharProb',         # Suspicious
        'CharContinuationRate' # Check this one
    ]
    
    # Add any found suspicious features
    all_problematic = list(set(known_problematic + suspicious_original))
    
    print(f"\n🚨 REMOVING problematic features: {all_problematic}")
    
    # Remove string columns
    string_cols = ['FILENAME', 'URL', 'Domain', 'TLD', 'Title']
    columns_to_remove = string_cols + all_problematic
    
    # Clean datasets
    original_clean = original.drop(columns=[col for col in columns_to_remove 
                                           if col in original.columns])
    
    alexa_clean = alexa.drop(columns=[col for col in all_problematic 
                                     if col in alexa.columns])
    
    print(f"\n✅ After cleaning:")
    print(f"   Original features: {len(original_clean.columns)}")
    print(f"   Alexa features: {len(alexa_clean.columns)}")
    
    # Get common features (EXCLUDING 'label')
    common_cols = list(set(original_clean.columns) & set(alexa_clean.columns))
    
    if 'label' in common_cols:
        common_cols.remove('label')
    
    print(f"\n📊 Using {len(common_cols)} clean features")
    
    # Prepare features and labels
    X_original = original_clean[common_cols]
    X_alexa = alexa_clean[common_cols]
    y_original = original['label']
    
    # Balance dataset
    print("\n⚖️ Balancing dataset...")
    
    X_phishing = X_original[y_original == 1]
    X_legit_original = X_original[y_original == 0]
    
    print(f"   Phishing: {len(X_phishing)}")
    print(f"   Original legitimate: {len(X_legit_original)}")
    print(f"   Alexa legitimate: {len(X_alexa)}")
    
    # Take samples
    legit_samples_original = min(50000, len(X_legit_original))
    legit_samples_alexa = min(17500, len(X_alexa))
    
    X_legit_combined = pd.concat([
        X_legit_original.sample(n=legit_samples_original, random_state=42),
        X_alexa.sample(n=legit_samples_alexa, random_state=42)
    ])
    
    # Combine
    X_final = pd.concat([X_phishing, X_legit_combined])
    y_final = pd.concat([
        pd.Series([1] * len(X_phishing)),
        pd.Series([0] * len(X_legit_combined))
    ])
    
    # Shuffle
    shuffle_idx = np.random.permutation(len(X_final))
    X_final = X_final.iloc[shuffle_idx].reset_index(drop=True)
    y_final = y_final.iloc[shuffle_idx].reset_index(drop=True)
    
    print(f"\n✅ Final dataset:")
    print(f"   Samples: {len(X_final)}")
    print(f"   Features: {len(X_final.columns)}")
    print(f"   Phishing: {(y_final == 1).sum()} ({(y_final == 1).mean():.1%})")
    print(f"   Legitimate: {(y_final == 0).sum()} ({(y_final == 0).mean():.1%})")
    
    # Check class balance sanity
    if (y_final == 1).mean() > 0.7 or (y_final == 1).mean() < 0.3:
        print(f"⚠️  Warning: Class imbalance detected!")
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_final, y_final, test_size=0.2, random_state=42, stratify=y_final
    )
    
    print(f"\n🤖 Training REAL XGBoost model...")
    print(f"   Training: {X_train.shape}")
    print(f"   Testing: {X_test.shape}")
    
    # Realistic model (prevent overfitting)
    model = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        eval_metric=['logloss', 'error', 'auc']
    )
    
    print("   Training (this might take a minute)...")
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n📊 REAL Model Performance:")
    print(f"   Accuracy:  {accuracy:.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    print(f"\n🎯 Confusion Matrix:")
    print(f"                Predicted")
    print(f"                Legit  Phishing")
    print(f"Actual Legit     {tn:>5}   {fp:>5}")
    print(f"Actual Phishing  {fn:>5}   {tp:>5}")
    
    # Calculate rates
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0
    print(f"\n   False Positive Rate: {fpr:.3%}")
    print(f"   False Negative Rate: {fnr:.3%}")
    
    # Classification report
    print(f"\n📋 Detailed Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    
    # Feature importance
    print(f"\n🏆 Top 15 Important Features (REAL):")
    importance_df = pd.DataFrame({
        'feature': X_train.columns.tolist(),
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(importance_df.head(15).to_string(index=False))
    
    # Save if realistic
    os.makedirs('../models', exist_ok=True)
    
    if 0.75 <= accuracy <= 0.95:
        print(f"\n💾 Saving REALISTIC enhanced model...")
        
        model_path = '../models/production_xgboost_enhanced.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        feature_path = '../models/feature_names_phiusiil.pkl'
        with open(feature_path, 'wb') as f:
            pickle.dump(X_train.columns.tolist(), f)
        
        print(f"✅ Model saved: {model_path}")
        print(f"✅ Features saved: {feature_path}")
        
        # Also save model info
        info = {
            'accuracy': float(accuracy),
            'features': len(X_train.columns),
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'phishing_ratio': float((y_final == 1).mean()),
            'problematic_features_removed': all_problematic
        }
        
        import json
        with open('../models/model_info_enhanced.json', 'w') as f:
            json.dump(info, f, indent=2)
        
        print(f"✅ Model info saved: ../models/model_info_enhanced.json")
    else:
        print(f"\n⚠️  Model NOT saved - unrealistic accuracy: {accuracy:.2%}")
        print(f"   (Expected: 75-95%, Got: {accuracy:.2%})")
    
    return model, accuracy, importance_df

if __name__ == "__main__":
    print("=" * 70)
    print("REALISTIC PHISHING DETECTION MODEL TRAINING")
    print("=" * 70)
    
    model, accuracy, importance_df = realistic_retrain()
    
    print(f"\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    if accuracy > 0.99:
        print("❌ STILL UNREALISTIC: 100% accuracy")
        print("   There's STILL data leakage somewhere!")
        print("   Check other features for perfect prediction")
    elif accuracy > 0.95:
        print("⚠️  Borderline: {accuracy:.2%} accuracy")
        print("   Might still have some data leakage")
        print("   But acceptable for initial testing")
    elif 0.85 <= accuracy <= 0.95:
        print(f"✅ EXCELLENT: {accuracy:.2%} accuracy")
        print("   Realistic performance achieved!")
        print("   Model should generalize well")
    elif 0.75 <= accuracy < 0.85:
        print(f"👍 GOOD: {accuracy:.2%} accuracy")
        print("   Acceptable real-world performance")
        print("   Could be improved with better features")
    else:
        print(f"⚠️  LOW: {accuracy:.2%} accuracy")
        print("   Needs improvement")
        print("   Consider feature engineering or more data")
    
    print("=" * 70)