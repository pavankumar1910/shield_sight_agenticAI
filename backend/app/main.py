"""
ShieldSight Backend API - Production Ready
- Task 7.2: Request Logging
- Task 9.3: Concurrent Request Tracking & Metrics
"""

from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import time
import logging
import traceback
from collections import deque
import threading
from typing import Dict
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# Internal imports
from app.routes import health, predict, user, contact
from app.ml_model import ml_model
from app.utils.logger import setup_logging
from app.utils.cache import prediction_cache, explanation_cache
from fastapi.staticfiles import StaticFiles
import os

# -------------------------------------------------
# Setup Logging
# -------------------------------------------------
logger = setup_logging(logging.INFO)

# -------------------------------------------------
# Thread-safe Request Tracker
# -------------------------------------------------
class RequestTracker:
    """Tracks requests, responses, errors, and provides metrics"""
    def __init__(self, max_size: int = 5000):
        self._lock = threading.Lock()
        self._requests = deque(maxlen=max_size)
        self._status_counts = {}
        self._error_counts = {}

    def track_request(self, path: str, method: str):
        with self._lock:
            self._requests.append({
                "timestamp": datetime.utcnow(),
                "path": path,
                "method": method
            })

    def track_response(self, path: str, status_code: int):
        with self._lock:
            key = f"{path}:{status_code}"
            self._status_counts[key] = self._status_counts.get(key, 0) + 1

    def track_error(self, path: str, error_type: str):
        with self._lock:
            key = f"{path}:{error_type}"
            self._error_counts[key] = self._error_counts.get(key, 0) + 1

    def get_metrics(self) -> Dict:
        with self._lock:
            now = datetime.utcnow()
            one_minute_ago = now - timedelta(minutes=1)
            last_minute = [r for r in self._requests if r["timestamp"] >= one_minute_ago]

            # Top endpoints in last minute
            endpoint_counts = {}
            for req in last_minute:
                key = f"{req['method']} {req['path']}"
                endpoint_counts[key] = endpoint_counts.get(key, 0) + 1

            return {
                "current_time": now.isoformat(),
                "total_requests": len(self._requests),
                "requests_last_minute": len(last_minute),
                "requests_per_second": round(len(last_minute)/60, 2),
                "top_endpoints": sorted(endpoint_counts.items(), key=lambda x: x[1], reverse=True)[:5],
                "status_codes": dict(sorted(self._status_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
                "error_counts": dict(sorted(self._error_counts.items(), key=lambda x: x[1], reverse=True)[:10])
            }

# Global tracker instance
request_tracker = RequestTracker()

# -------------------------------------------------
# Lifespan Events
# -------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ShieldSight API starting up...")

    if not ml_model.is_loaded():
        try:
            if (success := ml_model.load_model()):
                logger.info("ML model loaded successfully")
            else:
                logger.error("ML model failed to load (files might be missing or corrupted)")
        except Exception as e:
            logger.error(f"Critical error during ML model startup: {e}")
            # We don't necessarily want to crash the whole API if the model fails
            # because the rule-based fallback can still work.

    logger.info("API docs: /docs | /redoc")
    logger.info("Health: /health | Metrics: /metrics")
    
    # Clear caches on startup
    prediction_cache.clear()
    explanation_cache.clear()
    logger.info("Prediction and explanation caches cleared")

    app.state.start_time = time.time()  # Track uptime
    yield
    logger.info("ShieldSight API shutting down...")

# -------------------------------------------------
# FastAPI App
# -------------------------------------------------
app = FastAPI(
    title="ShieldSight API",
    description="AI-Powered Phishing Detection with Explainable Predictions",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# -------------------------------------------------
# CORS Middleware
# -------------------------------------------------
# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '').split(',') if os.getenv('ALLOWED_ORIGINS') else [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://shieldsight.vercel.app",
    "https://shieldsight-gsnq.onrender.com",
    "chrome-extension://*"
]

# Clean up whitespace
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# -------------------------------------------------
# GZip Compression Middleware (60-80% smaller responses)
# -------------------------------------------------
app.add_middleware(GZipMiddleware, minimum_size=1000)

# -------------------------------------------------
# Logging + Tracking Middleware
# -------------------------------------------------
@app.middleware("http")
async def logging_and_tracking(request: Request, call_next):
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID", "unknown")
    client_ip = request.client.host if request.client else "unknown"

    request_tracker.track_request(request.url.path, request.method)
    logger.info(f"REQUEST | ID: {request_id[:8]} | {request.method} {request.url.path} | Client: {client_ip}")

    try:
        response = await call_next(request)
        duration = time.time() - start_time

        request_tracker.track_response(request.url.path, response.status_code)
        logger.info(f"RESPONSE | ID: {request_id[:8]} | {request.method} {request.url.path} | Status: {response.status_code} | Duration: {duration:.3f}s")

        # Performance headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration:.3f}s"

        return response
    except Exception as e:
        duration = time.time() - start_time
        error_type = type(e).__name__
        request_tracker.track_error(request.url.path, error_type)
        logger.error(f"ERROR | ID: {request_id[:8]} | {request.method} {request.url.path} | Error: {error_type} | Duration: {duration:.3f}s")
        logger.error(traceback.format_exc())
        raise

# -------------------------------------------------
# Metrics Endpoint
# -------------------------------------------------
@app.get("/metrics")
async def metrics():
    import psutil
    data = request_tracker.get_metrics()
    data.update({
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "uptime_seconds": time.time() - app.state.start_time
        },
        "model": {
            "loaded": ml_model.is_loaded(),
            "feature_count": len(ml_model.get_feature_names()) if ml_model.is_loaded() else 0
        },
        "cache": {
            "prediction_cache": prediction_cache.stats(),
            "explanation_cache": explanation_cache.stats()
        }
    })
    return data

# -------------------------------------------------
# Exception Handlers
# -------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception(request: Request, exc: RequestValidationError):
    request_id = request.headers.get("X-Request-ID", "unknown")
    logger.warning(f"Validation error | ID: {request_id[:8]} | Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
            "request_id": request_id
        }
    )

@app.exception_handler(Exception)
async def global_exception(request: Request, exc: Exception):
    request_id = request.headers.get("X-Request-ID", "unknown")
    logger.error(f"Unhandled exception | ID: {request_id[:8]} | Path: {request.url.path}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id
        }
    )

# -------------------------------------------------
# Include Routers
# -------------------------------------------------
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(user.router)
app.include_router(contact.router)

# Mount static files for uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# -------------------------------------------------
# Root Endpoint
# -------------------------------------------------
@app.get("/")
async def root():
    return {
        "message": "ShieldSight API - AI-Powered Phishing Detection",
        "version": "2.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "metrics": "/metrics",
            "predict": "/predict",
            "explain": "/predict/explain",
            "batch": "/predict/batch"
        },
        "model_loaded": ml_model.is_loaded()
    }

# -------------------------------------------------
# Local Entry Point
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info",
        access_log=False
    )