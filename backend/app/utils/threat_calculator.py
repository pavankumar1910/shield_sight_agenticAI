"""
Threat Index Calculator - PRODUCTION VERSION
Combines multiple signals into single 0-100 score
"""

from typing import Dict

def calculate_threat_index(
    ml_confidence: float,
    shap_risk_weight: float,
    availability_risk: float,
    geo_risk: float,
    proxy_risk: float,
    prediction: str
) -> Dict:
    """
    Calculate comprehensive threat index (0-100)
    
    Args:
        ml_confidence: ML model confidence (0-1)
        shap_risk_weight: SHAP-derived risk weight (0-1)
        availability_risk: Availability check risk (0-1)
        geo_risk: Geo-blocking risk (0-1)
        proxy_risk: Proxy detection risk (0-1)
        prediction: 'phishing' or 'legitimate'
        
    Returns:
        {
            'threat_index': int (0-100),
            'threat_level': str,
            'breakdown': dict,
            'model_reliability': str
        }
    """
    
    # ✅ FIX 1: Clamp inputs to [0, 1]
    def clamp(value: float) -> float:
        """Ensure value is between 0 and 1"""
        try:
            return max(0.0, min(1.0, float(value)))
        except (TypeError, ValueError):
            return 0.0
    
    ml_confidence = clamp(ml_confidence)
    shap_risk_weight = clamp(shap_risk_weight)
    availability_risk = clamp(availability_risk)
    geo_risk = clamp(geo_risk)
    proxy_risk = clamp(proxy_risk)
    
    # ✅ FIX 2: ML score only contributes if phishing detected
    # Prevents false inflation for safe URLs
    if prediction == 'phishing':
        ml_score = ml_confidence * 40
    else:
        ml_score = 0  # Don't inflate score for safe URLs
    
    # Other scores
    shap_score = shap_risk_weight * 25
    avail_score = availability_risk * 15
    geo_score = geo_risk * 10
    proxy_score = proxy_risk * 10
    
    # ✅ FIX 3: Round instead of truncate
    total = ml_score + shap_score + avail_score + geo_score + proxy_score
    threat_index = min(100, round(total))
    
    # Determine threat level
    if threat_index >= 80:
        threat_level = 'CRITICAL'
    elif threat_index >= 60:
        threat_level = 'HIGH'
    elif threat_index >= 40:
        threat_level = 'MEDIUM'
    elif threat_index >= 20:
        threat_level = 'LOW'
    else:
        threat_level = 'MINIMAL'
    
    # ✅ NEW: Model reliability indicator
    # Based on prediction confidence and score distribution
    if ml_confidence >= 0.9 and shap_risk_weight >= 0.7:
        model_reliability = 'HIGH'
    elif ml_confidence >= 0.7 and shap_risk_weight >= 0.5:
        model_reliability = 'MEDIUM'
    else:
        model_reliability = 'LOW'
    
    return {
        'threat_index': threat_index,
        'threat_level': threat_level,
        'breakdown': {
            'ml_score': round(ml_score, 1),
            'shap_score': round(shap_score, 1),
            'availability_score': round(avail_score, 1),
            'geo_score': round(geo_score, 1),
            'proxy_score': round(proxy_score, 1)
        },
        'model_reliability': model_reliability  # ✅ NEW FIELD
    }