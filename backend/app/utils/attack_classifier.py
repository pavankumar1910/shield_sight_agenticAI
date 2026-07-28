"""
Attack Pattern Classifier
Classifies phishing into attack types
"""
from typing import Dict, List

def classify_attack_type(url: str, features: Dict, shap_values: List) -> str:
    """Classify phishing attack type"""
    
    url_lower = url.lower()
    
    # Credential Harvesting
    if any(keyword in url_lower for keyword in ['login', 'signin', 'account', 'verify', 'confirm']):
        if any(brand in url_lower for brand in ['paypal', 'amazon', 'google', 'facebook', 'microsoft']):
            return 'Brand Impersonation (Credential Harvesting)'
        return 'Credential Harvesting'
    
    # Payment Scam
    if any(keyword in url_lower for keyword in ['payment', 'invoice', 'billing', 'checkout']):
        return 'Payment Scam'
    
    # Survey/Prize Scam
    if any(keyword in url_lower for keyword in ['prize', 'winner', 'congratulations', 'survey', 'reward']):
        return 'Survey/Prize Scam'
    
    # Malware Dropper
    if any(keyword in url_lower for keyword in ['download', 'update', 'install', 'setup']):
        return 'Malware Dropper'
    
    return 'Generic Phishing'