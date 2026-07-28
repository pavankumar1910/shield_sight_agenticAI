"""
Pydantic Models for Request/Response Validation
ShieldSight - AI-Powered Phishing Detection
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


# ----------------------------
# Input Models
# ----------------------------

class URLInput(BaseModel):
    """Single URL input for prediction"""
    url: str = Field(..., description="URL to analyze", example="http://paypal-secure.com/login")


class URLBatchInput(BaseModel):
    """Batch URL input for predictions"""
    urls: List[str] = Field(..., description="List of URLs to analyze")


# ----------------------------
# Feature Contribution Model
# ----------------------------

class FeatureContribution(BaseModel):
    """Single feature contribution for explanation"""
    feature: str
    value: float
    contribution: float
    impact: str  # "positive" or "negative"


# ----------------------------
# GEO-BLOCKING & PROXY MODEL
# ----------------------------

class GeoAnalysis(BaseModel):
    """Geo-blocking and proxy analysis"""
    geolocation: Optional[Dict] = None
    blocked_in_countries: List[Dict] = []
    proxy_detection: Optional[Dict] = None
    is_geo_restricted: bool = False
    total_blocks: int = 0


# ----------------------------
# AVAILABILITY MODEL (NEW - ADD THIS!)
# ----------------------------

class Availability(BaseModel):
    """Website availability/accessibility check results"""
    status: Optional[str] = None
    is_accessible: Optional[bool] = None  # Can be None on timeout/error
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    ssl_valid: Optional[bool] = None
    ssl_details: Optional[str] = None
    has_redirects: Optional[bool] = None
    redirect_count: Optional[int] = 0
    final_url: Optional[str] = None
    error_message: Optional[str] = None
    server_info: Optional[str] = None
    headers: Optional[Dict[str, Any]] = {}
    security_flags: Optional[List[str]] = []
    security_assessment: Optional[Dict[str, Any]] = {}

    model_config = {"extra": "allow"}


# ----------------------------
# Response Models
# ----------------------------

class PredictionResponse(BaseModel):
    """Prediction response with details"""
    url: str
    # Original vs final (expanded) URL for QR scans / redirects
    original_url: Optional[str] = None
    final_url: Optional[str] = None
    prediction: str = Field(..., description="legitimate or phishing")
    confidence: float = Field(..., description="Prediction confidence (0-1 decimal, e.g., 0.95 = 95%)")
    phishing_probability: float
    legitimate_probability: float
    risk_level: str = Field(..., description="low, medium, high")
    
    # ✅ FIXED: Make summary optional, use Availability model
    summary: Optional[str] = None  # Changed from required to optional
    availability: Optional[Availability] = None  # Changed from Dict[str, Any]
    geo_analysis: Optional[GeoAnalysis] = None  # ← GEO/PROXY DETECTION
    
    # ✅ NEW: Threat Intelligence Fields
    threat_index: Optional[float] = None  # ← Overall threat score (0-100)
    threat_level: Optional[str] = None  # ← Critical/High/Medium/Low
    threat_breakdown: Optional[Dict[str, Any]] = None  # ← Individual risk components
    model_reliability: Optional[str] = None  # ← High/Medium/Low model confidence
    explainability_timeline: Optional[List[Dict[str, Any]]] = None  # ← Step-by-step analysis
    attack_type: Optional[str] = None  # ← Type of phishing attack detected
    
    metadata: Dict[str, Any]
    timestamp: str
    
    model_config = {
        "protected_namespaces": (),  # Allow model_reliability field
        "json_schema_extra": {
            "example": {
                "url": "http://phishing-site.tk",
                "prediction": "phishing",
                "confidence": 0.95,
                "phishing_probability": 0.95,
                "legitimate_probability": 0.05,
                "risk_level": "critical",
                "threat_index": 87,
                "threat_level": "HIGH",
                "model_reliability": "HIGH",
                "attack_type": "credential_harvesting",
                "metadata": {"processing_time_ms": 150},
                "timestamp": "2026-01-05T12:00:00Z"
            }
        }
    }


class ExplanationResponse(BaseModel):
    """SHAP / Feature importance explanation response"""
    url: str
    prediction: str
    confidence: float
    explanation_method: str
    base_value: float  # ✅ Only one base_value field
    top_features: List[FeatureContribution]  # Accept objects, not dicts
    
    # ✅ FIXED: Use Availability model, make summary optional
    summary: Optional[str] = None
    availability: Optional[Availability] = None  # Changed from Dict[str, Any]
    
    metadata: Optional[Dict[str, Any]] = None
    # ❌ REMOVED: Don't have duplicate base_value field!


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    timestamp: str
    version: str
    model_config = {
        "protected_namespaces": ()
    }


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
    timestamp: str


class APIInfo(BaseModel):
    """API information"""
    name: str
    version: str
    endpoints: Dict[str, str]
    rate_limits: Dict[str, str]
    status: str


class BatchURLInput(BaseModel):
    """Batch URL input"""
    urls: List[str] = Field(..., min_items=1, max_items=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "urls": [
                    "http://paypal-secure.com/login",
                    "https://www.google.com",
                    "http://banking-verify.tk"
                ]
            }
        }


class BatchPredictionResponse(BaseModel):
    """Batch prediction response"""
    total: int
    successful: int
    failed: int
    results: List[PredictionResponse]
    errors: List[Dict[str, str]]
    timestamp: str