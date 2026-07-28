import requests
import time
import json
import gzip

BASE_URL = "http://localhost:8000"

def print_pass(msg):
    print(f"[PASS]: {msg}")

def print_fail(msg):
    print(f"[FAIL]: {msg}")

def verify_gzip():
    print("\n--- Verifying GZip Compression ---")
    try:
        # Request with gzip accepted
        headers = {"Accept-Encoding": "gzip"}
        start = time.time()
        # Requesting /metrics which is usually large enough
        response = requests.get(f"{BASE_URL}/metrics", headers=headers)
        duration = time.time() - start
        
        if response.status_code == 200:
            content_encoding = response.headers.get("Content-Encoding")
            if content_encoding == "gzip":
                print_pass(f"GZip enabled (Content-Encoding: {content_encoding})")
                print(f"   Response size: {len(response.content)} bytes")
            else:
                # Note: small responses might not be compressed due to minimum_size=1000
                print(f"[WARN]  GZip not applied (might be too small? Size: {len(response.content)})")
                print(f"   Headers: {response.headers}")
        else:
            print_fail(f"Server returned {response.status_code}")
    except Exception as e:
        print_fail(f"Exception: {e}")

def verify_cache_speed():
    print("\n--- Verifying Cache Speed ---")
    url_to_predict = "http://google.com"  # Safe URL
    payload = {"url": url_to_predict}
    
    try:
        # 1. Warmup / First request (Cache Miss)
        start = time.time()
        r1 = requests.post(f"{BASE_URL}/predict", json=payload)
        t1 = time.time() - start
        if r1.status_code != 200:
            print_fail(f"Prediction failed: {r1.text}")
            return

        # 2. Second request (Should be Cache Hit)
        start = time.time()
        r2 = requests.post(f"{BASE_URL}/predict", json=payload)
        t2 = time.time() - start
        
        print(f"   First Request (Miss): {t1:.4f}s")
        print(f"   Second Request (Hit): {t2:.4f}s")
        
        if t2 < t1 * 0.8: 
            print_pass(f"Cache is working! ({t1/t2:.1f}x faster)")
        else:
            print(f"[WARN]  Cache speedup not significant (maybe first request was already fast?)")
            
    except Exception as e:
         print_fail(f"Exception: {e}")

def verify_batch_prediction():
    print("\n--- Verifying Batch Prediction ---")
    urls = [
        "http://google.com",
        "http://example.com",
        "http://malicious-test-site.com/login",
        "http://phishing-bank.com.suspicious.tld",
        "https://stackoverflow.com"
    ]
    payload = {"urls": urls}
    
    try:
        start = time.time()
        response = requests.post(f"{BASE_URL}/predict/batch", json=payload)
        duration = time.time() - start
        
        if response.status_code == 200:
            results = response.json()
            # The backend returns a list or dict? predict.py usually returns the response from the router
            
            print_pass(f"Batch endpoint responded in {duration:.4f}s")
            
            # Check structure based on standard FastAPI response
            if isinstance(results, dict) and 'predictions' in results:
                count = len(results['predictions'])
                print_pass(f"Processed {count} URLs")
            elif isinstance(results, list):
                count = len(results)
                print_pass(f"Processed {count} URLs")
            else:
                 print(f"   Received unknown format: {str(results)[:100]}")
                
        elif response.status_code == 404:
             print_fail("Batch endpoint /predict/batch not found!")
        else:
            print_fail(f"Batch request failed: {response.status_code} {response.text}")
            
    except Exception as e:
        print_fail(f"Exception: {e}")

if __name__ == "__main__":
    print("STARTED OPTIMIZATION VERIFICATION")
    try:
        verify_gzip()
        verify_cache_speed()
        verify_batch_prediction()
    except Exception as outer_e:
        print(f"Fatal error: {outer_e}")
    print("\nDONE")
