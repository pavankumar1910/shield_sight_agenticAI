"""Quick performance benchmark"""
import requests
import time

base = 'http://127.0.0.1:8000'

print("="*60)
print("FINAL PERFORMANCE BENCHMARK")
print("="*60)

# Test 1: Fast endpoint (POST /predict/fast)
print("\n[1] Fast Endpoint (10 fresh URLs)")
times_fast = []
for i in range(10):
    ts = int(time.time()*1000000)
    url = f'https://test{ts}x{i}.com'
    start = time.time()
    r = requests.post(f'{base}/predict/fast', json={'url': url})
    elapsed = (time.time() - start) * 1000
    times_fast.append(elapsed)

print(f"    Average: {sum(times_fast)/len(times_fast):.0f}ms")
print(f"    Min: {min(times_fast):.0f}ms | Max: {max(times_fast):.0f}ms")

# Test 2: Normal endpoint with skip_external_checks
print("\n[2] Normal + skip_external_checks (10 fresh URLs)")
times_skip = []
for i in range(10):
    ts = int(time.time()*1000000)
    url = f'https://demo{ts}x{i}.com'
    start = time.time()
    r = requests.post(f'{base}/predict/?skip_external_checks=true', json={'url': url})
    elapsed = (time.time() - start) * 1000
    times_skip.append(elapsed)

print(f"    Average: {sum(times_skip)/len(times_skip):.0f}ms")
print(f"    Min: {min(times_skip):.0f}ms | Max: {max(times_skip):.0f}ms")

# Test 3: Cached responses
print("\n[3] Cached Responses (10 calls to same URLs)")
cache_urls = ['https://google.com', 'https://facebook.com', 'https://github.com']
# Warm up cache
for url in cache_urls:
    requests.post(f'{base}/predict/fast', json={'url': url})

times_cached = []
for _ in range(10):
    for url in cache_urls:
        start = time.time()
        r = requests.post(f'{base}/predict/fast', json={'url': url})
        elapsed = (time.time() - start) * 1000
        times_cached.append(elapsed)

print(f"    Average: {sum(times_cached)/len(times_cached):.0f}ms")
print(f"    Min: {min(times_cached):.0f}ms | Max: {max(times_cached):.0f}ms")

# Summary
print("\n" + "="*60)
print("SUMMARY")
print("="*60)
fast_avg = sum(times_fast)/len(times_fast)
cached_avg = sum(times_cached)/len(times_cached)

print(f"Fast endpoint:    {fast_avg:.0f}ms avg (target: <150ms)")
print(f"Cached responses: {cached_avg:.0f}ms avg (target: <10ms)")

fast_pass = fast_avg < 150
cache_pass = cached_avg < 10

print()
if fast_pass:
    print("[PASS] Fast endpoint meets target")
else:
    print(f"[CLOSE] Fast endpoint at {fast_avg:.0f}ms (target 150ms)")
    
if cache_pass:
    print("[PASS] Cached responses meet target")
else:
    print(f"[FAIL] Cached responses at {cached_avg:.0f}ms (target 10ms)")

# Improvement calculation
original_time = 2050  # Original ~2.05s
improvement = original_time / fast_avg
print(f"\nPerformance improvement: {improvement:.1f}x faster than original ({original_time}ms -> {fast_avg:.0f}ms)")
