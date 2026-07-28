"""
Performance benchmark
"""

import requests
import time
import statistics

BASE_URL = "http://localhost:8000"

def benchmark_predictions(n=100):
    """Benchmark prediction performance"""
    print(f"🏃 Running {n} predictions...")
    
    times = []
    test_url = "http://test-phishing.com/login"
    
    for i in range(n):
        start = time.time()
        response = requests.post(
            f"{BASE_URL}/predict/",
            json={"url": test_url}
        )
        duration = time.time() - start
        times.append(duration)
        
        if (i + 1) % 10 == 0:
            print(f"  Completed: {i+1}/{n}")
    
    print(f"\n📊 Results:")
    print(f"  Total requests: {n}")
    print(f"  Mean time: {statistics.mean(times):.3f}s")
    print(f"  Median time: {statistics.median(times):.3f}s")
    print(f"  Min time: {min(times):.3f}s")
    print(f"  Max time: {max(times):.3f}s")
    print(f"  Std dev: {statistics.stdev(times):.3f}s")
    print(f"\n  Requests/second: {1/statistics.mean(times):.1f}")

if __name__ == "__main__":
    benchmark_predictions(100)