"""
Explainability Timeline
Converts SHAP into WHY → HOW → WHAT format
"""
from typing import Dict, List

def generate_timeline(
    prediction: str,
    shap_values: List,
    features: Dict,
    url: str
) -> Dict:
    """Generate explainability timeline"""
    
    # Extract top 3 risky features
    top_features = sorted(shap_values, key=lambda x: abs(x['value']), reverse=True)[:3]
    
    # WHY
    why_reasons = []
    for feat in top_features:
        if feat['contribution'] == 'increases_risk':
            why_reasons.append(f"• {feat['feature_display']}: {feat['explanation']}")
    
    # HOW (attack vectors)
    how_attacks = _generate_attack_vectors(top_features, url)
    
    # WHAT (recommendations)
    what_actions = _generate_actions(prediction, top_features)
    
    return {
        'why_flagged': why_reasons,
        'how_exploited': how_attacks,
        'what_to_do': what_actions
    }

def _generate_attack_vectors(features, url):
    """Generate attack explanations"""
    vectors = []
    
    for feat in features:
        if 'tld' in feat['feature'].lower():
            vectors.append("Phishers use cheap/suspicious TLDs to avoid detection")
        elif 'https' in feat['feature'].lower():
            vectors.append("Missing HTTPS makes it easier to intercept data")
        elif 'length' in feat['feature'].lower():
            vectors.append("Long URLs with obfuscation hide malicious intent")
    
    return vectors[:3]

def _generate_actions(prediction, features):
    """Generate actionable recommendations"""
    if prediction == 'phishing':
        return [
            "🚫 DO NOT click this link",
            "🛡️ DO NOT enter credentials or personal information",
            "📧 Report this to your security team",
            "🗑️ Delete the email/message containing this link"
        ]
    else:
        return [
            "✅ URL appears safe to visit",
            "🔍 Still verify the domain matches your expectation",
            "🔒 Ensure HTTPS connection before entering sensitive data"
        ]