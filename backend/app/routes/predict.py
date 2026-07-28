"""
Prediction Routes - ShieldSight
PRODUCTION FINAL VERSION - Complete & Optimized WITH ALEXA FIXES + SUMMARY + LINK CHECKER
FIXED: Better availability error handling
PERFORMANCE: Optional SHAP, background tasks, fast prediction mode
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import asyncio
from functools import lru_cache
from urllib.parse import urlparse
from typing import List, Dict, Optional
import re
import time
import requests
import hashlib

# Import all required modules
from app.models import (
    URLInput, URLBatchInput,
    PredictionResponse, ExplanationResponse, FeatureContribution
)
from app.ml_model import ml_model
from app.utils.feature_extraction import feature_extractor
from app.utils.validators import url_validator
from app.utils.cache import prediction_cache, explanation_cache
from app.utils.summary_generator import generate_summary  # ← SUMMARY GENERATION
from app.utils.link_checker import check_url_availability  # ← LINK CHECKER
from app.utils.geo_checker import GeoProxyChecker  # ← GEO/PROXY CHECKER
from app.utils.threat_calculator import calculate_threat_index  # ← THREAT INDEX
from app.utils.explainability_timeline import generate_timeline  # ← TIMELINE
from app.utils.attack_classifier import classify_attack_type  # ← ATTACK CLASSIFIER
from app.utils.qr_decoder import QRDecoder
from fastapi import UploadFile, File
from app.utils.document_parser import DocumentParser

router = APIRouter(prefix="/predict", tags=["Predictions"])
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════

def get_url_hash(url: str) -> str:
    """Generate cache key for URL using MD5 hash"""
    return hashlib.md5(url.strip().lower().encode()).hexdigest()


def secure_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and injection attacks"""
    # Remove path components (handle both Unix and Windows separators)
    filename = filename.split('/')[-1].split('\\')[-1]
    # Remove dangerous characters, keep only alphanumeric, dots, underscores, hyphens
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    # Limit length to prevent filesystem issues
    if len(filename) > 255:
        # Keep extension
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    return filename

# Common URL shorteners to detect and expand
SHORTENERS = {
    "qrco.de", "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
    "ow.ly", "buff.ly", "tiny.cc", "lc.chat", "rb.gy"
}


def expand_url_sync(url: str, timeout: int = 5) -> str:
    """Resolve redirects synchronously using a HEAD request and return final URL.

    This uses a lightweight HEAD request with allow_redirects=True. If any
    error occurs, the original URL is returned to avoid blocking analysis.
    """
    try:
        resp = requests.head(url, allow_redirects=True, timeout=timeout)
        # requests will follow redirects and resp.url will be final
        return resp.url or url
    except Exception:
        return url

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate the Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

# -------------------------------
# SMART WHITELIST SYSTEM
# -------------------------------
HIGH_TRUST_DOMAINS = {
    # Search Engines & Tech Giants
    'google.com', 'google.co.in', 'google.co.jp', 'google.co.uk', 'google.de', 
    'google.fr', 'google.com.br', 'google.it', 'google.es', 'google.ca',
    'google.com.au', 'google.ru', 'google.pl', 'google.nl', 'google.co.id',
    'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.ru',
    
    # Social Media
    'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 
    'reddit.com', 'pinterest.com', 'tumblr.com', 'snapchat.com',
    'tiktok.com', 'vk.com', 'weibo.com', 'whatsapp.com',
    
    # E-commerce
    'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.co.jp',
    'ebay.com', 'alibaba.com', 'taobao.com', 'tmall.com', 'aliexpress.com',
    'walmart.com', 'target.com', 'bestbuy.com', 'etsy.com', 'shopify.com',
    
    # Microsoft
    'microsoft.com', 'live.com', 'outlook.com', 'office.com', 'msn.com',
    'bing.com', 'windows.com', 'xbox.com', 'skype.com',
    
    # Media & Entertainment
    'youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'soundcloud.com',
    'imdb.com', 'cnn.com', 'bbc.com', 'nytimes.com', 'theguardian.com',
    'forbes.com', 'bloomberg.com', 'reuters.com', 'espn.com',
    
    # Chinese Sites
    'qq.com', 'sohu.com', 'sina.com.cn', '163.com', '360.cn',
    'jd.com', 'bilibili.com', 'zhihu.com', 'douban.com',
    
    # Cloud & CDN
    'cloudflare.com', 'amazonaws.com', 'googleusercontent.com', 
    'cloudfront.net', 'akamai.net', 'fastly.net', 'cdn.jsdelivr.net',
    
    # Finance
    'paypal.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'citibank.com', 'hsbc.com', 'visa.com', 'mastercard.com',
    
    # Education & Knowledge
    'wikipedia.org', 'wikimedia.org', 'stackoverflow.com', 'github.com',
    'gitlab.com', 'bitbucket.org', 'medium.com', 'wordpress.com',
    'leetcode.com', 'hackerrank.com', 'geeksforgeeks.org',
    
    # Government & Organizations
    'gov', 'gov.uk', 'gov.in', 'gov.au', 'gov.ca',
    'europa.eu', 'un.org', 'who.int', 'unesco.org',
    
    # Popular Services
    'dropbox.com', 'zoom.us', 'slack.com', 'discord.com', 'telegram.org',
    'apple.com', 'icloud.com', 'adobe.com', 'salesforce.com',
    'canva.com', 'notion.so', 'trello.com', 'asana.com',
    
    # Travel & Maps
    'booking.com', 'airbnb.com', 'expedia.com', 'tripadvisor.com',
    'maps.google.com', 'maps.apple.com', 'waze.com',
    
    # Others
    'archive.org', 'craigslist.org', 'flickr.com', 'vimeo.com',
    'dailymotion.com', 'blogger.com', 'wordpress.org',
}

PHISHING_KEYWORDS = {
    'login', 'verify', 'secure', 'account', 'update', 'confirm',
    'banking', 'payment', 'wallet', 'credential', 'password',
}

def analyze_domain_risk(url: str) -> tuple[bool, str, float]:
    """Smart domain analysis with regex phishing keyword detection - ALEXA SAFE"""
    try:
        # 🔥 ALEXA FIX: Handle both standard URLs and Alexa-style inputs
        parsed = urlparse(url.lower())
        netloc = parsed.netloc if parsed.netloc else parsed.path
        
        # Remove www. prefix
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        
        # 🔥 ALEXA FIX: Handle paths that might contain slashes
        # Extract only the domain part before first slash if present
        if '/' in netloc:
            netloc = netloc.split('/')[0]
        
        # 🔥 ALEXA FIX: Additional validation for malformed URLs
        if not netloc or '.' not in netloc:
            return False, "invalid_domain_format", 0.0
        
        # Trusted TLDs (strong signal) - CHECK THESE FIRST
        for tld in ['.gov', '.edu', '.mil']:
            if netloc.endswith(tld):
                return True, f"trusted_tld_{tld}", 0.4
        
        # Exact domain match
        if netloc in HIGH_TRUST_DOMAINS:
            return True, "exact_domain_match", 0.3
        
        # Subdomain check (mail.google.com -> google.com)
        parts = netloc.split('.')
        if len(parts) > 2:
            for i in range(1, len(parts)):
                parent_domain = '.'.join(parts[i:])
                if parent_domain in HIGH_TRUST_DOMAINS:
                    return True, f"subdomain_of_{parent_domain}", 0.2
        
        # 🎉 ALLOW OFFICIAL .google TLD (e.g., skills.google)
        if netloc.endswith('.google'):
             return True, "authorized_google_tld", 0.4

        # Regex phishing keyword check (whole words only) - ONLY if not trusted

        # 🔥 BRAND MIMICRY DETECTION (New Strict Rules)
        # Patterns that indicate high risk if not strictly matching official domains
        BRAND_PATTERNS = {
            'google': {'google.com', 'google.co', 'accounts.google.com', 'drive.google.com', 'docs.google.com', 'google.co.in', 'google.ad', 'google.io'},
            'paypal': {'paypal.com', 'paypal.me', 'paypal.co'},
            'amazon': {'amazon.com', 'amazon.co', 'aws.amazon.com'},
            'facebook': {'facebook.com', 'fb.com', 'messenger.com'},
            'instagram': {'instagram.com'},
            'microsoft': {'microsoft.com', 'office.com', 'live.com', 'outlook.com', 'azure.com'},
            'apple': {'apple.com', 'icloud.com'},
            'netflix': {'netflix.com'},
            'linkedin': {'linkedin.com'},
            'chase': {'chase.com'},
            'wellsfargo': {'wellsfargo.com'},
        }

        # Check for brand names in the domain (e.g., 'accounts-google' contains 'google')
        if not isinstance(netloc, str):
             netloc = str(netloc)
             
        for brand, allowed_domains in BRAND_PATTERNS.items():
            if brand in netloc:
                # It contains the brand name. Now check if it's authorized.
                is_authorized = False
                
                # Check exact match or subdomain of allowed
                for allowed in allowed_domains:
                    if netloc == allowed or netloc.endswith('.' + allowed):
                        is_authorized = True
                        break
                
                if not is_authorized:
                    # Brand is present but NOT authorized -> High Risk Phishing
                    return False, f"brand_mimicry_detected_{brand}", -0.9

        # 🔥 TYPO-SQUATTING DETECTION
        # Check against high trust domains for lookalikes
        if len(netloc) > 4: # Only check sufficiently long domains
            for trusted in HIGH_TRUST_DOMAINS:
                # Skip if length difference is too big optimization
                if abs(len(netloc) - len(trusted)) > 2:
                    continue
                
                dist = levenshtein_distance(netloc, trusted)
                # If distance is small (1-2) but not 0 (exact match was already handled)
                if 0 < dist <= 2:
                    # Logic: If it looks like google.com but isn't google.com -> HIGH RISK
                    return False, f"typosquatting_detected_target_{trusted}", -0.8

        return False, "not_whitelisted", 0.0
        
    except Exception as e:
        logger.warning(f"Domain analysis error for {url[:50]}: {str(e)}")
        return False, "parse_error", 0.0

# -------------------------------
# BACKGROUND TASK: COMPUTE EXPLANATION
# -------------------------------
async def compute_and_cache_explanation_background(
    url: str,
    url_hash: str,
    features_df,
    prediction: str,
    confidence: float
):
    """Background task to compute SHAP explanation and cache it"""
    try:
        logger.info(f"Background: Computing explanation for {url[:50]}...")
        
        # Compute SHAP explanation
        explanation = await asyncio.wait_for(
            asyncio.to_thread(ml_model.get_shap_explanation, features_df),
            timeout=5.0  # Longer timeout for background
        )
        
        # Cache the explanation
        explanation_data = {
            "url": url,
            "url_hash": url_hash,
            "prediction": prediction,
            "confidence": confidence,
            "explanation": explanation,
            "computed_at": datetime.utcnow().isoformat()
        }
        explanation_cache.set(url, explanation_data, ttl=900)
        logger.info(f"Background: Explanation cached for {url[:50]}")
        
    except asyncio.TimeoutError:
        logger.warning(f"Background: Explanation timeout for {url[:50]}")
    except Exception as e:
        logger.error(f"Background: Explanation failed for {url[:50]}: {e}")


# -------------------------------
# CORE PREDICTION ENGINE
# -------------------------------
async def predict_single_url(
    url: str,
    include_explanation: bool = True,
    skip_external_checks: bool = False,
    background_tasks: Optional[BackgroundTasks] = None
) -> PredictionResponse:
    """
    Core prediction logic with caching and domain intelligence.
    
    Args:
        url: URL to analyze
        include_explanation: If False, skip SHAP computation for 10x faster response
        skip_external_checks: If True, skip availability and geo checks (100ms vs 2s)
        background_tasks: FastAPI BackgroundTasks for async SHAP computation
    """
    start_time = time.time()
    url = url.strip()
    url_hash = get_url_hash(url)
    from_cache = False
    availability = None
    
    # 1. Check cache first (INSTANT if cached)
    cached = prediction_cache.get(url)
    if cached:
        from_cache = True
        logger.debug(f"Cache HIT: {url[:50]} (hash: {url_hash[:8]})")
        return cached
    
    # 2. Validate URL
    is_valid, error_msg = url_validator.is_valid_url(url)
    if not is_valid:
        logger.warning(f"Invalid URL rejected: {url}")
        raise HTTPException(
            status_code=400,
            detail={
                "error": "InvalidURL",
                "message": error_msg,
                "example": "https://example.com",
                "received": url
            }
        )
    
    # 3. Check ML model availability
    if not ml_model.is_loaded():
        logger.error("ML model not loaded")
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    # 4. Domain risk analysis
    is_whitelisted, domain_reason, domain_boost = analyze_domain_risk(url)
    logger.debug(f"Domain analysis: {url} -> {domain_reason} (boost: {domain_boost:.2f})")
    
    # 5. Extract features and get ML prediction
    feature_names = ml_model.get_feature_names()
    features_df = feature_extractor.extract_with_defaults(url, feature_names)
    
    predictions, probabilities = ml_model.predict(features_df)
    pred_class = int(predictions[0])
    phishing_prob = float(probabilities[0][0])
    legit_prob = float(probabilities[0][1])
    ml_confidence = max(phishing_prob, legit_prob)
    
    logger.debug(f"[{url_hash[:6]}] ML prediction: {phishing_prob:.3f}/{legit_prob:.3f}")
    
    # 6. Apply domain confidence adjustment
    if domain_boost > 0:
        final_confidence = min(ml_confidence + (domain_boost * (1 - ml_confidence)), 0.99)
    elif domain_boost < 0:
        final_confidence = max(ml_confidence * (1 + domain_boost), 0.01)
    else:
        final_confidence = ml_confidence
    
    logger.debug(f"[{url_hash[:6]}] Confidence after domain boost: {final_confidence:.3f}")
    
    # 7. Smart prediction override logic
    if is_whitelisted and domain_boost > 0.2:
        # Strong whitelist signal
        # ✅ FIXED: Stricter override. Only override if ML is extremely confident (e.g. 99% phishing) AND legitimate prob is near zero
        # This prevents false positives for Google, PayPal, etc.
        if legit_prob < 0.05 and phishing_prob > 0.95:
            # ML strongly indicates phishing - override whitelist
            prediction = "phishing"
            final_confidence = phishing_prob
            domain_reason += "_ml_overridden"
            logger.info(f"Whitelist overridden by ML (High Confidence): {url}")
        else:
            # Trust the whitelist
            prediction = "legitimate"
            final_confidence = max(final_confidence, 0.8)
    
    # 7b. Handling typo-squatting or Brand Mimicry (Critical Override)
    elif "typosquatting_detected" in domain_reason or "brand_mimicry_detected" in domain_reason:
        prediction = "phishing"
        # High confidence for lookalikes
        final_confidence = max(final_confidence, 0.95)
        logger.warning(f"Lookalike/Mimicry detected: {url} -> {domain_reason}")

    else:
        # Trust ML prediction
        prediction = "phishing" if pred_class == 0 else "legitimate"
    
    # 8. Determine risk level
    if prediction == "phishing":
        if final_confidence >= 0.90:
            risk_level = "critical"
        elif final_confidence >= 0.75:
            risk_level = "high"
        elif final_confidence >= 0.60:
            risk_level = "medium"
        else:
            risk_level = "low"
    else:
        if final_confidence >= 0.95:
            risk_level = "very_low"
        elif final_confidence >= 0.85:
            risk_level = "low"
        elif final_confidence >= 0.70:
            risk_level = "caution"
        else:
            risk_level = "warning"
            
    # ✨ OFFLINE SITE HANDLING
    # If we determine later that the site is offline, we should bump "legitimate" to "caution" or "warning"
    # This logic happens here conceptually, but we don't have availability yet.
    # We will adjust risk_level after availability check if needed.
    
    # ═══════════════════════════════════════════════════════════
    # ✨ PERFORMANCE: CONDITIONAL SHAP COMPUTATION
    # If include_explanation=False, skip SHAP for 10x faster response
    # ═══════════════════════════════════════════════════════════
    summary_text = None
    shap_values = None
    feature_dict = {}
    
    # Prepare feature dictionary (always needed for summary fallback)
    for col in features_df.columns:
        feature_dict[col] = float(features_df[col].iloc[0])
    feature_dict['confidence'] = final_confidence
    feature_dict['domain_boost'] = domain_boost
    feature_dict['is_whitelisted'] = is_whitelisted
    
    if include_explanation:
        # FULL MODE: Compute SHAP synchronously (slower but complete)
        try:
            # Get SHAP explanation for summary generation
            shap_explanation = await asyncio.wait_for(
                asyncio.to_thread(ml_model.get_shap_explanation, features_df),
                timeout=1.5  # Quick timeout for summary
            )
            shap_values = shap_explanation.get("shap_values")
            
            # Generate the summary
            summary_text = generate_summary(
                prediction=prediction,
                features=feature_dict,
                shap_values=shap_values
            )
            
            logger.debug(f"Summary generated for: {url}")
            
        except asyncio.TimeoutError:
            logger.warning(f"Summary generation timeout for: {url}")
            summary_text = f"This URL appears to be {prediction} with {final_confidence:.1%} confidence."
        except Exception as e:
            logger.warning(f"Summary generation failed for {url}: {str(e)}")
            # Fallback summary
            if prediction == "phishing":
                summary_text = f"WARNING: This URL has been classified as potentially dangerous with {final_confidence:.1%} confidence. Exercise extreme caution."
            else:
                summary_text = f"✓ This URL appears safe with {final_confidence:.1%} confidence based on our analysis."
    else:
        # FAST MODE: Skip SHAP, use quick summary (10x faster!)
        logger.debug(f"Fast mode: Skipping SHAP for {url[:50]}")
        if prediction == "phishing":
            summary_text = f"⚠️ WARNING: This URL has been classified as potentially dangerous with {final_confidence:.1%} confidence."
        else:
            summary_text = f"✓ This URL appears safe with {final_confidence:.1%} confidence."
        
        # Queue background SHAP computation if background_tasks provided
        if background_tasks:
            background_tasks.add_task(
                compute_and_cache_explanation_background,
                url,
                url_hash,
                features_df,
                prediction,
                final_confidence
            )
            logger.debug(f"Background: Queued explanation computation for {url[:50]}")
    
    # ═══════════════════════════════════════════════════════════
    # ✨ PERFORMANCE: PARALLEL EXTERNAL CHECKS
    # Run availability and geo-analysis concurrently to save ~5-10 seconds
    # ═══════════════════════════════════════════════════════════
    availability = None
    geo_analysis = None
    
    if not skip_external_checks:
        logger.debug(f"[{url_hash[:6]}] Starting parallel external checks...")
        
        async def check_availability_safely():
            try:
                a_start = time.time()
                result = await asyncio.wait_for(
                    asyncio.to_thread(check_url_availability, url, timeout=3),
                    timeout=4.0
                )
                logger.debug(f"[{url_hash[:6]}] Availability check took: {time.time() - a_start:.2f}s")
                return result
            except Exception as e:
                logger.warning(f"[{url_hash[:6]}] Availability check error: {str(e)}")
                return {"status": "error", "is_accessible": False, "error_message": str(e)}

        async def check_geo_safely():
            try:
                g_start = time.time()
                geo_checker = GeoProxyChecker()
                result = await asyncio.wait_for(
                    geo_checker.full_geo_analysis(url),
                    timeout=6.0
                )
                logger.debug(f"[{url_hash[:6]}] Geo analysis took: {time.time() - g_start:.2f}s")
                return result
            except Exception as e:
                logger.warning(f"[{url_hash[:6]}] Geo analysis error: {str(e)}")
                return None

        # Run both in parallel
        a_task, g_task = await asyncio.gather(
            check_availability_safely(),
            check_geo_safely()
        )
        
        # Process Availability Result
        availability_result = a_task
        
        # Determine accessibility - be optimistic for whitelisted sites on timeout
        is_accessible_raw = availability_result.get("is_accessible")
        if is_accessible_raw is None: # Timeout or error-based unknown
            # If it's a known safe site, assume it's ONLINE unless we got a clear error
            is_accessible = True if is_whitelisted else False
        else:
            is_accessible = bool(is_accessible_raw)

        availability = {
            "status": availability_result.get("status", "unknown"),
            "is_accessible": is_accessible,
            "status_code": availability_result.get("status_code"),
            "response_time_ms": availability_result.get("response_time_ms"),
            "ssl_valid": availability_result.get("ssl_valid"),
            "has_redirects": availability_result.get("has_redirects", False),
            "redirect_count": availability_result.get("redirect_count", 0),
            "final_url": availability_result.get("final_url"),
            "error_message": availability_result.get("error_message"),
            "server_info": availability_result.get("server_info"),
            "headers": availability_result.get("headers", {}),
            "security_flags": availability_result.get("security_flags", []),
            "security_assessment": availability_result.get("security_assessment", {})
        }
        
        # Process Geo Result
        if g_task:
            geo_result = g_task
            geo_analysis = {
                "geolocation": geo_result.get("geolocation") or {},
                "blocked_in_countries": geo_result.get("blocked_in_countries", []),
                "proxy_detection": geo_result.get("proxy_detection") or {},
                "is_geo_restricted": geo_result.get("is_geo_restricted", False),
                "total_blocks": geo_result.get("total_blocks", 0)
            }
        
        # ✨ ADJUST RISK LEVEL FOR OFFLINE OR RESTRICTED SITES
        if availability:
            is_restricted = availability.get('status_code') in [403, 405]
            is_offline = not availability.get('is_accessible')
            
            # ✨ AGGRESSIVE OVERRIDE FOR RESTRICTED TYPOSQUATTING
            if ("typosquatting_detected" in domain_reason) and (is_offline or is_restricted):
                prediction = "phishing"
                final_confidence = 0.99
                risk_level = "critical"
                summary_text = f"🚨 CRITICAL: This URL is a lookalike (typo-squatting) and is currently restricted or offline. This is a very strong indicator of a malicious phishing landing page."
                logger.warning(f"Aggressive phishing override for restricted lookalike: {url}")
            
            if prediction == 'legitimate' and not is_whitelisted:
                if is_offline or is_restricted:
                    if risk_level in ['very_low', 'low']:
                        risk_level = 'caution'
                        status_reason = "OFFLINE" if is_offline else f"RESTRICTED (HTTP {availability.get('status_code')})"
                        summary_text = f"⚠️ Caution: This site is currently {status_reason}. While it shares characteristics with legitimate sites, we cannot verify its current content and its restricted status is unusual for a public site."
                        final_confidence = min(final_confidence, 0.70)
    
    # ═══════════════════════════════════════════════════════════
    # ✨ CRITICAL SIGNAL OVERRIDE
    # HTTPS + Invalid SSL/Offline = High Risk
    # ═══════════════════════════════════════════════════════════
    if prediction == 'legitimate' and availability:
        # Check if features indicate HTTPS usage (use existing features_df)
        has_https_feature = features_df['IsHTTPS'].iloc[0] == 1.0 if 'IsHTTPS' in features_df.columns else False
        
        # If model thinks it's legit because of HTTPS, but SSL is actually invalid or site is dead...
        if has_https_feature and (availability.get('ssl_valid') is False or availability.get('is_accessible') is False):
             # Only override if we aren't whitelisted
             if not is_whitelisted:
                 prediction = "phishing"
                 final_confidence = max(final_confidence, 0.65) # Valid suspicion
                 risk_level = "medium"
                 summary_text = "⚠️ Suspicious: This site appears to use HTTPS but has invalid security certificates or is offline. This is a common pattern for abandoned phishing sites."
                 logger.warning(f"Signal Override: HTTPS set but SSL invalid/offline for {url}")

    # ═══════════════════════════════════════════════════════════
    # ✨ NEW: CALCULATE THREAT INTELLIGENCE
    # ═══════════════════════════════════════════════════════════
    
    # Calculate risk scores for threat index
    shap_risk = 0.0
    if shap_values and len(shap_values) > 0:
        # Average absolute SHAP values
        shap_risk = sum(abs(v) for v in shap_values) / len(shap_values)
        shap_risk = min(1.0, shap_risk)  # Normalize
    
    # Availability risk (0-1)
    avail_risk = 0.0
    if availability:
        if availability.get('status') == 'error':
            avail_risk = 0.8
        elif not availability.get('is_accessible'):
            avail_risk = 0.6
        elif not availability.get('ssl_valid'):
            avail_risk = 0.4
    
    # Geo risk (0-1)
    geo_risk = 0.0
    if geo_analysis:
        geo_risk = min(1.0, geo_analysis.get('total_blocks', 0) / 5)
        proxy_data = geo_analysis.get('proxy_detection') or {}
        if proxy_data.get('is_proxy_url'):
            geo_risk = max(geo_risk, 0.5)
    
    # Proxy risk (0-1)
    proxy_risk = 0.0
    if geo_analysis:
        proxy_data = geo_analysis.get('proxy_detection') or {}
        if proxy_data.get('is_proxy_url'):
            confidence_level = proxy_data.get('confidence', 'low')
            proxy_risk = {'high': 0.9, 'medium': 0.6, 'low': 0.3}.get(confidence_level, 0.3)
    
    # Calculate threat index
    threat_data = calculate_threat_index(
        ml_confidence=final_confidence,
        shap_risk_weight=shap_risk,
        availability_risk=avail_risk,
        geo_risk=geo_risk,
        proxy_risk=proxy_risk,
        prediction=prediction
    )
    
    # Generate explainability timeline
    timeline = None
    if shap_values and feature_dict:
        try:
            # Convert SHAP values to expected format with contribution and display names
            shap_explanations = []
            if isinstance(shap_values, (list, tuple)):
                feature_names = list(feature_dict.keys())
                for i, val in enumerate(shap_values):
                    if i < len(feature_names):
                        feat_name = feature_names[i]
                        shap_explanations.append({
                            'feature': feat_name,
                            'value': val,
                            'feature_display': feat_name.replace('_', ' ').title(),
                            'contribution': 'increases_risk' if val > 0 else 'decreases_risk',
                            'explanation': f"Value: {feature_dict.get(feat_name, 'N/A')}"
                        })
            
            timeline = generate_timeline(
                prediction=prediction,
                shap_values=shap_explanations if shap_explanations else shap_values,
                features=feature_dict,
                url=url
            )
        except Exception as e:
            logger.warning(f"Timeline generation failed for {url}: {str(e)}")
            timeline = None
    
    # Classify attack type
    attack_type = None
    if prediction == 'phishing':
        try:
            # Convert SHAP values to expected format with contribution and display names
            shap_explanations = []
            if isinstance(shap_values, (list, tuple)):
                feature_names = list(feature_dict.keys())
                for i, val in enumerate(shap_values):
                    if i < len(feature_names):
                        feat_name = feature_names[i]
                        shap_explanations.append({
                            'feature': feat_name,
                            'value': val,
                            'feature_display': feat_name.replace('_', ' ').title(),
                            'contribution': 'increases_risk' if val > 0 else 'decreases_risk',
                            'explanation': f"Value: {feature_dict.get(feat_name, 'N/A')}"
                        })
            
            attack_type = classify_attack_type(
                url=url,
                features=feature_dict,
                shap_values=shap_explanations if shap_explanations else shap_values
            )
        except Exception as e:
            logger.warning(f"Attack classification failed for {url}: {str(e)}")
            attack_type = None
    
    # 9. Build response (NOW WITH SUMMARY, AVAILABILITY, GEO ANALYSIS, AND THREAT INTELLIGENCE!)
    response = PredictionResponse(
        url=url,
        prediction=prediction,
        confidence=round(final_confidence, 4),
        phishing_probability=round(phishing_prob, 4),
        legitimate_probability=round(legit_prob, 4),
        risk_level=risk_level,
        summary=summary_text,  # ← SUMMARY
        availability=availability,  # ← LINK STATUS
        geo_analysis=geo_analysis,  # ← GEO/PROXY DETECTION
        threat_index=threat_data.get('threat_index'),  # ← THREAT INDEX
        threat_level=threat_data.get('threat_level'),  # ← THREAT LEVEL
        threat_breakdown=threat_data.get('breakdown'),  # ← BREAKDOWN
        model_reliability=threat_data.get('model_reliability'),  # ← RELIABILITY
        explainability_timeline=timeline,  # ← TIMELINE
        attack_type=attack_type,  # ← ATTACK TYPE
        metadata={
            "url_hash": url_hash,  # ← URL HASH for explanation lookup
            "domain_analysis": domain_reason,
            "domain_boost": round(domain_boost, 4),
            "ml_confidence": round(ml_confidence, 4),
            "processing_time_ms": round((time.time() - start_time) * 1000, 2),
            "from_cache": from_cache,
            "include_explanation": include_explanation,  # ← Whether SHAP was computed
            "model_version": ml_model.get_version() if hasattr(ml_model, "get_version") else "1.0",
            "has_summary": summary_text is not None,
            "has_availability": availability is not None
        },
        timestamp=datetime.utcnow().isoformat()
    )
    
    # 10. Cache with appropriate TTL
    if prediction == "legitimate" and final_confidence > 0.9:
        ttl = 86400  # 24 hours for high-confidence legitimate
    elif prediction == "phishing" and final_confidence > 0.85:
        ttl = 43200  # 12 hours for high-confidence phishing
    else:
        ttl = 1800   # 30 minutes for uncertain predictions
    
    prediction_cache.set(url, response, ttl)
    
    logger.info(f"Prediction: {url[:50]}... -> {prediction} "
                f"(conf: {final_confidence:.2f}, boost: {domain_boost:.2f}, "
                f"accessible: {availability.get('is_accessible') if availability else 'N/A'}, "
                f"time: {response.metadata['processing_time_ms']}ms)")
    
    return response 



# -------------------------------
# HEALTH CHECK ENDPOINT
# -------------------------------
@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "prediction-api",
        "model_loaded": ml_model.is_loaded(),
        "model_ready": True,
        "timestamp": datetime.utcnow().isoformat(),
        "cache_size": getattr(prediction_cache, "size", "unknown") if hasattr(prediction_cache, "size") else "unknown"
    }

# -------------------------------
# MAIN API ENDPOINTS
# -------------------------------
@router.post("/", response_model=PredictionResponse)
async def predict_url(
    url_input: URLInput,
    background_tasks: BackgroundTasks,
    include_explanation: bool = Query(
        default=True,
        description="Include SHAP explanation (set to false for faster response)"
    ),
    skip_external_checks: bool = Query(
        default=False,
        description="Skip availability & geo checks (set to true for ~100ms response)"
    )
):
    """
    Predict if a single URL is phishing or legitimate.
    
    **Performance Tips:**
    - Set `include_explanation=false` to skip SHAP computation
    - Set `skip_external_checks=true` to skip availability & geo checks
    - Use `/predict/fast` endpoint for maximum speed (~50-100ms)
    """
    try:
        return await predict_single_url(
            url_input.url,
            include_explanation=include_explanation,
            skip_external_checks=skip_external_checks,
            background_tasks=background_tasks
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed for URL {url_input.url}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/fast", response_model=PredictionResponse)
async def predict_url_fast(
    url_input: URLInput,
    background_tasks: BackgroundTasks
):
    """
    🚀 FAST prediction endpoint - optimized for speed (<200ms).
    
    Skips SHAP explanation AND external checks (availability, geo analysis).
    Use this when you need quick responses and can fetch explanations later.
    """
    try:
        return await predict_single_url(
            url_input.url,
            include_explanation=False,
            skip_external_checks=True,  # ← Skip availability & geo checks for speed
            background_tasks=background_tasks
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fast prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/explanation/{url_hash}")
async def get_cached_explanation(url_hash: str):
    """
    Fetch a cached explanation by URL hash.
    
    Use this after calling /predict/fast to get the explanation once it's computed.
    The URL hash is returned in the prediction response metadata.
    """
    # Search all cached explanations
    for url in list(explanation_cache._cache.keys()):
        cached = explanation_cache.get(url)
        if cached and cached.get("url_hash") == url_hash:
            return {
                "status": "found",
                "url": cached.get("url"),
                "explanation": cached.get("explanation"),
                "computed_at": cached.get("computed_at")
            }
    
    return {
        "status": "pending",
        "message": "Explanation not yet computed or expired. Try again in a few seconds."
    }


@router.post("/batch")
async def predict_batch(
    batch_input: URLBatchInput,
    include_explanation: bool = Query(
        default=False,
        description="Include SHAP explanations (slower). Default: false for faster batch processing."
    )
):
    """
    Predict multiple URLs with concurrency control.
    
    **Performance Tip:** Batch predictions default to fast mode (no SHAP) for speed.
    Set `include_explanation=true` if you need explanations.
    """
    start_time = time.time()
    urls = batch_input.urls
    
    # Validate batch size
    if len(urls) > 100:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "BatchLimitExceeded",
                "message": "Maximum 100 URLs per batch",
                "received": len(urls),
                "limit": 100
            }
        )
    
    # Concurrency control (max 20 concurrent predictions)
    semaphore = asyncio.Semaphore(20)
    
    async def process_with_limit(url: str):
        async with semaphore:
            # Use fast mode for batch (no SHAP) unless explicitly requested
            return await predict_single_url(url, include_explanation=include_explanation)
    
    # Process all URLs
    tasks = [process_with_limit(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Aggregate results
    successes = []
    errors = []
    cache_hits = 0
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            if isinstance(result, HTTPException):
                error_detail = result.detail
                if isinstance(error_detail, dict):
                    error_msg = error_detail.get("message", str(error_detail))
                else:
                    error_msg = str(error_detail)
            else:
                error_msg = "Processing error"
            
            errors.append({
                "index": i,
                "url": urls[i],
                "error": error_msg[:100]  # Limit error message length
            })
        else:
            successes.append(result)
            if result.metadata.get("from_cache"):
                cache_hits += 1
    
    total_time = round((time.time() - start_time) * 1000, 2)
    
    logger.info(f"Batch processed: {len(urls)} URLs, "
                f"{len(successes)} successful, {len(errors)} failed, "
                f"{cache_hits} cache hits, {total_time}ms total")
    
    return {
        "total": len(urls),
        "successful": len(successes),
        "failed": len(errors),
        "cache_hits": cache_hits,
        "cache_misses": len(successes) - cache_hits,
        "processing_time_ms": total_time,
        "avg_time_per_url_ms": round(total_time / len(urls), 2) if urls else 0,
        "concurrency_limit": 20,
        "results": successes,
        "errors": errors,
        "timestamp": datetime.utcnow().isoformat()
    }
@router.post("/document-scan")
async def analyze_document(
    file: UploadFile = File(...)
):
    """
    Extract and analyze URLs from document
    
    Supported formats:
    - PDF (.pdf)
    - Word (.docx, .doc)
    - Text (.txt)
    """
    try:
        # ✅ Sanitize filename to prevent path traversal
        safe_filename = secure_filename(file.filename)
        
        # Validate file type
        file_ext = safe_filename.split('.')[-1].lower()
        if file_ext not in ['pdf', 'docx', 'doc', 'txt']:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: .{file_ext}. Supported: PDF, DOCX, TXT"
            )
        
        # Read file
        file_bytes = await file.read()
        
        if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size: 10MB"
            )
        
        # Extract URLs
        parser = DocumentParser()
        extraction_result = parser.extract_urls(file_bytes, file_ext)
        
        if not extraction_result['urls']:
            return {
                'file_name': safe_filename,
                'file_type': extraction_result['file_type'],
                'urls_found': 0,
                'results': [],
                'message': 'No URLs found in document'
            }
        
        # Remove duplicates
        unique_urls = {}
        for item in extraction_result['urls']:
            url = item['url']
            if url not in unique_urls:
                unique_urls[url] = item
        
        # Analyze each unique URL
        results = []
        for url, metadata in unique_urls.items():
            try:
                prediction = await predict_single_url(url)
                result_dict = prediction.dict()
                result_dict['document_metadata'] = metadata
                results.append(result_dict)
            except Exception as e:
                logger.error(f"Failed to analyze {url}: {e}")
                results.append({
                    'url': url,
                    'error': str(e),
                    'document_metadata': metadata
                })
        
        # Generate summary
        total_urls = len(results)
        phishing_count = sum(1 for r in results if r.get('prediction') == 'phishing')
        safe_count = total_urls - phishing_count
        
        logger.info(f"Document scan: {safe_filename}, {total_urls} URLs, {phishing_count} phishing")
        
        return {
            'file_name': safe_filename,
            'file_type': extraction_result['file_type'],
            'urls_found': total_urls,
            'phishing_detected': phishing_count,
            'safe_urls': safe_count,
            'results': results,
            'document_info': {
                'total_pages': extraction_result.get('total_pages'),
                'total_paragraphs': extraction_result.get('total_paragraphs'),
                'total_lines': extraction_result.get('total_lines')
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Document analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Document analysis failed")

@router.post("/qr-scan", response_model=List[PredictionResponse])
async def analyze_qr_code(
    qr_input: dict  # {"image": "base64_string"}
):
    """
    Analyze URLs from QR code image
    
    Supports:
    - Camera capture (base64)
    - File upload (base64)
    - Any image format (PNG, JPG, WEBP)
    """
    try:
        # Decode QR code
        qr_decoder = QRDecoder()
        decoded_qrs = qr_decoder.decode_from_base64(qr_input['image'])
        
        if not decoded_qrs:
            raise HTTPException(
                status_code=400,
                detail="No URLs found in QR code. Please ensure the QR code is clear and contains a URL."
            )
        
        # Analyze each URL found (expand shorteners before analysis)
        results = []
        for qr_data in decoded_qrs:
            original_url = qr_data['data']

            # ✅ Use QRDecoder's built-in shortener detection
            is_shortened = QRDecoder.is_shortened_url(original_url)
            final_url = original_url
            redirect_chain = []

            # ✅ Expand shortened URLs using QRDecoder
            if is_shortened:
                try:
                    final_url, redirect_chain = await asyncio.to_thread(
                        QRDecoder.expand_url, original_url
                    )
                    logger.info(f"Expanded {original_url} -> {final_url}")
                except Exception as e:
                    logger.warning(f"URL expansion failed for {original_url}: {e}")
                    final_url = original_url

            # Use existing prediction logic on the (possibly expanded) final URL
            prediction_result = await predict_single_url(final_url)

            # Add QR metadata and original/final URL information
            prediction_result_dict = prediction_result.dict()
            prediction_result_dict['original_url'] = original_url
            prediction_result_dict['final_url'] = final_url
            prediction_result_dict['qr_metadata'] = {
                'original_url': original_url,
                'is_shortened': is_shortened,
                'final_url': final_url,
                'redirect_chain': redirect_chain,
                'quality': qr_data['quality'],
                'type': qr_data['type'],
                'position': qr_data['rect']
            }

            results.append(prediction_result_dict)
        
        logger.info(f"QR analysis completed: {len(results)} URL(s) found")
        return results
        
    except ValueError as e:
        logger.error(f"QR decode error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"QR analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="QR analysis failed")

@router.post("/explain", response_model=ExplanationResponse)
async def explain_prediction(url_input: URLInput):
    """Generate explanation for a prediction with fallbacks"""
    try:
        url = url_input.url.strip()
        
        # Check explanation cache (cached as dict to avoid serialization issues)
        cached = explanation_cache.get(url)
        if cached:
            logger.debug(f"Explanation cache hit: {url}")
            return JSONResponse(content=cached)
        
        # Get prediction - SKIP external checks here as the main /predict/ call handles them
        # This prevents double networking and saves ~5-10 seconds
        prediction = await predict_single_url(url, include_explanation=False, skip_external_checks=True)
        is_whitelisted, domain_reason, domain_boost = analyze_domain_risk(url)
        
        feature_names = ml_model.get_feature_names()
        features_df = feature_extractor.extract_with_defaults(url, feature_names)
        
        top_features = []
        explanation_method = "unknown"
        
        # Domain-based explanation for whitelisted
        if is_whitelisted and domain_boost > 0.2:
            pass
        else:
            # ML-based explanation
            try:
                # Get SHAP explanation with timeout using already extracted features_df
                explanation = await asyncio.wait_for(
                    asyncio.to_thread(ml_model.get_shap_explanation, features_df),
                    timeout=2.0
                )
                
                for feat in explanation.get("top_features", [])[:8]:
                    feature_name = feat.get("feature", "unknown")
                    contribution = float(feat.get("contribution", 0))
                    feature_value = float(features_df[feature_name].iloc[0]) if feature_name in features_df.columns else 0.0
                    impact = "positive" if contribution > 0 else "negative"
                    
                    top_features.append(FeatureContribution(
                        feature=feature_name,
                        value=round(feature_value, 4),
                        contribution=round(contribution, 4),
                        impact=impact
                    ))
                
                explanation_method = explanation.get("method", "shap")
                
            except asyncio.TimeoutError:
                logger.warning(f"SHAP explanation timeout for: {url}")
                explanation_method = "timeout"
                # Fallback to basic feature importance
                if hasattr(ml_model, 'get_feature_importance'):
                    try:
                        importance = ml_model.get_feature_importance()
                        for feat_name, importance_val in importance[:5]:
                            top_features.append(FeatureContribution(
                                feature=feat_name,
                                value=0.5,
                                contribution=round(importance_val, 4),
                                impact="unknown"
                            ))
                        explanation_method = "feature_importance_fallback"
                    except:
                        pass
            except Exception as e:
                logger.warning(f"SHAP explanation failed for {url}: {str(e)}")
                explanation_method = "fallback"
        
        # Include domain factor if relevant
        if domain_boost != 0:
            # 🚨 RENAMING FOR BETTER EXPLAINABILITY
            feature_name = "Domain Analysis"
            if "brand_mimicry" in domain_reason:
                feature_name = "Brand Mimicry Rule"
            elif "typosquatting" in domain_reason:
                feature_name = "Typosquatting Rule"
            elif domain_boost > 0.2:
                feature_name = "Trusted Domain Reputation"
                
            top_features.insert(0, FeatureContribution(
                feature=feature_name,
                value=1.0 if is_whitelisted else 0.0,
                contribution=round(domain_boost, 4),
                impact="positive" if domain_boost > 0 else "negative"
            ))

        # 🚨 EXPLAINABILITY FOR INVALID SSL / OFFLINE OVERRIDE
        # If prediction is phishing due to signal override, we need to show it in SHAP
        if prediction.prediction == 'phishing' and prediction.availability:
             has_https = features_df['IsHTTPS'].iloc[0] == 1.0 if 'IsHTTPS' in features_df.columns else False
             # ✅ SAFE ACCESS: availability is a Pydantic model
             ssl_valid = prediction.availability.ssl_valid
             is_accessible = prediction.availability.is_accessible
             
             if has_https and (ssl_valid is False or is_accessible is False):
                 # This was likely the override trigger
                 top_features.insert(0, FeatureContribution(
                     feature="Invalid Security Config",
                     value=1.0,
                     contribution=-0.8, # Strong negative impact
                     impact="negative"
                 ))
        
        # If no features extracted, add at least prediction confidence
        if not top_features:
            top_features.append(FeatureContribution(
                feature="Prediction Confidence",
                value=prediction.confidence,
                contribution=prediction.confidence - 0.5,
                impact="positive" if prediction.confidence > 0.5 else "negative"
            ))
        
        # Build explanation response
        response = ExplanationResponse(
            url=url,
            prediction=prediction.prediction,
            confidence=prediction.confidence,
            explanation_method=explanation_method,
            base_value=0.5,
            top_features=top_features[:10],
            summary=prediction.summary,  # ← INCLUDE SUMMARY
            availability=prediction.availability,  # ← INCLUDE AVAILABILITY
            metadata={
                "domain_analysis": domain_reason,
                "domain_boost": round(domain_boost, 4),
                "prediction_metadata": prediction.metadata
            }
        )
        
        # Cache explanation
        explanation_cache.set(url, response.model_dump(), ttl=900)
        logger.info(f"Explanation generated: {url} -> method: {explanation_method}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Explanation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Explanation error")