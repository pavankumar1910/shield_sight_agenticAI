"""
AI Summary Generator for Phishing Predictions
Generates human-readable summaries with risk factors and recommendations
UPDATED: Returns a STRING (not dict) to match backend expectations
"""

import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

def generate_summary(prediction: str, features: dict, shap_values: list) -> str:
    """
    Generate human-readable summary - UPDATED to return string
    
    Args:
        prediction: "phishing" or "legitimate"
        features: Dictionary of feature values
        shap_values: List of SHAP values with contributions
        
    Returns:
        Human-readable summary string
    """
    try:
        confidence = features.get('confidence', 0.5)
        
        # Feature explanations based on SHAP contributions
        FEATURE_EXPLANATIONS = {
            'URLSimilarityIndex': {
                'low': 'URL tries to imitate a well-known brand',
                'high': 'URL looks unique and original'
            },
            'HasHTTPS': {
                'true': 'Uses secure HTTPS connection',
                'false': 'No HTTPS security (missing padlock)'
            },
            'URLLength': {
                'long': 'URL is suspiciously long',
                'short': 'URL length is normal'
            },
            'IsDomainIP': {
                'true': 'Uses IP address instead of domain (suspicious)',
                'false': 'Uses proper domain name'
            },
            'HasSuspiciousTLD': {
                'true': 'Uses free suspicious domain (.tk, .ml, .ga)',
                'false': 'Uses reputable domain extension'
            },
            'NumSensitiveWords': {
                'high': 'Contains phishing keywords (login, bank, secure)',
                'low': 'No suspicious keywords detected'
            },
            'SubdomainLevel': {
                'high': 'Too many subdomains (possible obfuscation)',
                'low': 'Normal domain structure'
            }
        }
        
        # Get top features from SHAP
        if shap_values:
            top_features = sorted(shap_values, key=lambda x: abs(x.get('contribution', 0)), reverse=True)[:5]
        else:
            top_features = []
        
        risk_factors = []
        safe_factors = []
        
        # Analyze features based on SHAP contributions
        for feat in top_features:
            name = feat.get('feature', '')
            contribution = feat.get('contribution', 0)
            
            if name in FEATURE_EXPLANATIONS:
                if contribution < 0:  # Pushes toward legitimate
                    explanation = FEATURE_EXPLANATIONS[name].get('high') or FEATURE_EXPLANATIONS[name].get('false')
                    if explanation:
                        safe_factors.append(f"✓ {explanation}")
                else:  # Pushes toward phishing
                    explanation = FEATURE_EXPLANATIONS[name].get('low') or FEATURE_EXPLANATIONS[name].get('true')
                    if explanation:
                        risk_factors.append(f"• {explanation}")
        
        # Add domain-based factors
        is_whitelisted = features.get('is_whitelisted', False)
        domain_boost = features.get('domain_boost', 0.0)
        
        if is_whitelisted and domain_boost > 0.2:
            safe_factors.append(f"✓ Recognized as trusted domain (trust boost: +{domain_boost:.0%})")
        
        # Check specific feature values for additional factors
        if features.get('IsHTTPS', 0) < 0.5:
            risk_factors.append("• No HTTPS (insecure connection)")
        else:
            safe_factors.append("✓ Uses secure HTTPS connection")
        
        if features.get('HasIPAddress', 0) > 0.5:
            risk_factors.append("• Uses IP address instead of domain name")
        
        if features.get('NumSensitiveWords', 0) > 2:
            risk_factors.append("• Contains phishing-related keywords")
        
        # Limit number of factors
        risk_factors = risk_factors[:5]
        safe_factors = safe_factors[:3]
        
        # Build the summary string
        summary_parts = []
        
        # Verdict
        if prediction == "phishing":
            summary_parts.append(f"🚨 **PHISHING DETECTED** (Confidence: {confidence:.1%})")
        else:
            summary_parts.append(f"✅ **LEGITIMATE SITE** (Confidence: {confidence:.1%})")
        
        # Domain info if whitelisted
        if is_whitelisted:
            summary_parts.append(f"✓ Recognized as trusted domain")
        
        # Risk factors
        if risk_factors:
            summary_parts.append("\n**⚠️ Risk Factors:**")
            summary_parts.extend(risk_factors)
        elif prediction == "phishing":
            # 🚨 Special case: If phishing but no specific ML risk factors, it's likely a rule-based override
            summary_parts.append("\n**⚠️ Risk Factors:**")
            summary_parts.append("• High-risk security policy violation (e.g., brand mimicry or invalid security configuration)")
        else:
            summary_parts.append("\n**✅ No significant risk factors detected**")
        
        # Safe factors
        if safe_factors:
            summary_parts.append("\n**✓ Safety Indicators:**")
            summary_parts.extend(safe_factors)
        
        # Recommendation based on confidence
        if prediction == "phishing":
            if confidence >= 0.90:
                summary_parts.append("\n**📋 Recommendation:**")
                summary_parts.append("DO NOT proceed. This is highly likely to be a phishing site designed to steal your credentials.")
                summary_parts.append("\n**🛡️ Recommended Actions:**")
                summary_parts.append("• DO NOT enter any personal information")
                summary_parts.append("• Close the tab immediately")
                summary_parts.append("• Report to your IT department")
            elif confidence >= 0.75:
                summary_parts.append("\n**📋 Recommendation:**")
                summary_parts.append("Extreme caution advised. This site exhibits multiple phishing characteristics.")
                summary_parts.append("\n**🛡️ Recommended Actions:**")
                summary_parts.append("• Avoid entering sensitive data")
                summary_parts.append("• Verify through official channels")
                summary_parts.append("• Check for HTTPS and SSL certificate")
        else:
            if confidence >= 0.95:
                summary_parts.append("\n**📋 Recommendation:**")
                summary_parts.append("Appears safe. Normal browsing precautions apply.")
            else:
                summary_parts.append("\n**📋 Recommendation:**")
                summary_parts.append("Probably safe, but remain vigilant.")
                summary_parts.append("\n**🛡️ Recommended Actions:**")
                summary_parts.append("• Verify the website legitimacy")
                summary_parts.append("• Check contact information")
        
        # Additional notes
        if confidence < 0.7:
            summary_parts.append(f"\n**Note:** Low confidence prediction. Verify through other means.")
        
        if is_whitelisted and prediction == "phishing":
            summary_parts.append(f"\n**⚠️ Important:** Despite being a known domain, this specific URL shows phishing characteristics.")
        
        return "\n".join(summary_parts)
        
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        # Fallback to simple summary
        if prediction == "phishing":
            return f"⚠️ WARNING: This URL has been classified as potentially dangerous with {features.get('confidence', 0.5):.1%} confidence. Exercise extreme caution."
        else:
            return f"✓ This URL appears safe with {features.get('confidence', 0.5):.1%} confidence based on our analysis."