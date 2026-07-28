"""
Health Check Routes - ShieldSight
COMPLETE VERSION WITH FIXED STATS
"""

from fastapi import APIRouter
from datetime import datetime
import logging
from app.ml_model import ml_model
from app.models import HealthResponse

# Import cache for stats
try:
    from app.utils.cache import prediction_cache, explanation_cache
    CACHE_AVAILABLE = True
except:
    CACHE_AVAILABLE = False

# -------------------------------
# Router & Logger
# -------------------------------
router = APIRouter(tags=["Health"])
logger = logging.getLogger(__name__)

# Simple request counter
_request_counter = {"total_requests": 0}

# -------------------------------
# Health Endpoint
# -------------------------------
@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        _request_counter["total_requests"] += 1
        model_loaded = ml_model.is_loaded()
        status = "healthy" if model_loaded else "degraded"
        
        return HealthResponse(
            status=status,
            model_loaded=model_loaded,
            timestamp=datetime.utcnow().isoformat(),
            version="1.0.0"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            timestamp=datetime.utcnow().isoformat(),
            version="1.0.0"
        )

# -------------------------------
# Root Endpoint
# -------------------------------
@router.get("/")
async def root():
    """Root endpoint"""
    try:
        _request_counter["total_requests"] += 1
        model_loaded = ml_model.is_loaded()
        return {
            "message": "ShieldSight API - AI-Powered Phishing Detection",
            "version": "1.0.0",
            "model_loaded": model_loaded,
            "docs": "/docs",
            "health": "/health"
        }
    except Exception as e:
        logger.error(f"Root endpoint failed: {e}")
        return {
            "message": "ShieldSight API - AI-Powered Phishing Detection",
            "version": "1.0.0",
            "model_loaded": False,
            "docs": "/docs",
            "health": "/health",
            "error": "Service initializing"
        }

# -------------------------------
# Statistics Endpoint (FIXED)
# -------------------------------
@router.get("/stats")
async def get_statistics():
    """
    Get API usage statistics
    FIXED: Now includes total_requests
    """
    try:
        _request_counter["total_requests"] += 1
        
        stats = {
            "total_requests": _request_counter["total_requests"],  # ✅ Added!
            "timestamp": datetime.utcnow().isoformat(),
            "model": {
                "loaded": ml_model.is_loaded(),
                "type": "XGBoost Classifier"
            }
        }
        
        # Add feature count if model loaded
        if ml_model.is_loaded():
            try:
                stats["model"]["num_features"] = len(ml_model.get_feature_names())
            except:
                stats["model"]["num_features"] = 0
        else:
            stats["model"]["num_features"] = 0
        
        # Add cache stats if available
        if CACHE_AVAILABLE:
            try:
                stats["cache"] = {
                    "prediction": prediction_cache.stats(),
                    "explanation": explanation_cache.stats()
                }
            except Exception as e:
                logger.warning(f"Failed to get cache stats: {e}")
                stats["cache"] = {"error": "Cache stats unavailable"}
        else:
            stats["cache"] = {"status": "not_enabled"}
        
        return stats
        
    except Exception as e:
        logger.error(f"Statistics endpoint failed: {e}", exc_info=True)
        return {
            "error": "Failed to retrieve statistics",
            "timestamp": datetime.utcnow().isoformat()
        }

# -------------------------------
# Model Info Endpoint
# -------------------------------
@router.get("/model/info")
async def model_info():
    """Get model information"""
    try:
        _request_counter["total_requests"] += 1
        
        # Check if model is loaded
        if not ml_model.is_loaded():
            return {
                "model_type": "XGBoost Classifier",
                "num_features": 0,
                "shap_available": False,
                "status": "not_loaded",
                "message": "Model not loaded yet"
            }
        
        # Get feature count safely
        try:
            feature_names = ml_model.get_feature_names()
            num_features = len(feature_names)
        except Exception as e:
            logger.warning(f"Failed to get feature names: {e}")
            num_features = 0
        
        # Check SHAP availability safely
        shap_available = False
        try:
            shap_available = ml_model._shap_explainer is not None
        except:
            shap_available = False
        
        return {
            "model_type": "XGBoost Classifier",
            "num_features": num_features,
            "shap_available": shap_available,
            "status": "ready"
        }
        
    except Exception as e:
        logger.error(f"Model info retrieval failed: {e}", exc_info=True)
        return {
            "model_type": "XGBoost Classifier",
            "num_features": 0,
            "shap_available": False,
            "status": "error",
            "error": "Failed to retrieve model info"
        }

# -------------------------------
# API Info Endpoint
# -------------------------------
@router.get("/info")
async def api_info():
    """Get API information"""
    try:
        _request_counter["total_requests"] += 1
        model_loaded = ml_model.is_loaded()
        feature_count = 0
        
        if model_loaded:
            try:
                feature_count = len(ml_model.get_feature_names())
            except:
                pass
        
        return {
            "name": "ShieldSight API",
            "version": "1.0.0",
            "endpoints": {
                "predict": "POST /predict/",
                "explain": "POST /predict/explain",
                "batch": "POST /predict/batch",
                "health": "GET /health",
                "stats": "GET /stats",
                "model_info": "GET /model/info",
                "docs": "GET /docs"
            },
            "status": "operational",
            "model": {
                "loaded": model_loaded,
                "features": feature_count,
                "type": "XGBoost"
            }
        }
    except Exception as e:
        logger.error(f"API info failed: {e}")
        return {
            "name": "ShieldSight API",
            "version": "1.0.0",
            "status": "degraded",
            "error": "Service initializing"
        }