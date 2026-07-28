"""Performance test for ShieldSight API optimizations"""
import requests
import time
import json
import random
import string

def random_suffix():
    """Generate random suffix to avoid cache"""
    return ''.join(random.choices(string.ascii_lowercase, k=8))

def main():
    print('=' * 60)
    print('PERFORMANCE TEST: SHIELDSIGHT API')
    print('=' * 60)

    base_url = 'http://127.0.0.1:8000'
    
    # Use unique URLs to avoid cache
    ts = int(time.time())
    test_urls_fresh = [
        f'https://test-{ts}-{random_suffix()}.example.com',
        f'https://demo-{ts}-{random_suffix()}.test.org',
        f'https://sample-{ts}-{random_suffix()}.mysite.net'
    ]
    
    # Known URLs for cache tests
    test_urls_cache = ['https://google.com', 'https://facebook.com', 'https://github.com']

    # 1. Test fast endpoint with FRESH URLs (no cache)
    print('\n[1] FAST ENDPOINT - FRESH URLs (no cache)')
    print('-' * 40)
    fast_times = []
    for url in test_urls_fresh:
        start = time.time()
        r = requests.post(f'{base_url}/predict/fast', json={'url': url})
        elapsed = (time.time() - start) * 1000
        fast_times.append(elapsed)
        data = r.json()
        short_url = url[:40] + '...'
        print(f'{short_url}: {elapsed:.0f}ms - {data.get("prediction", data.get("detail", "error"))}')
    print(f'Average: {sum(fast_times)/len(fast_times):.0f}ms')

    # 2. Test skip_external_checks with FRESH URLs
    print('\n[2] SKIP CHECKS - FRESH URLs (no cache)')
    print('-' * 40)
    skip_times = []
    ts2 = int(time.time())
    test_urls_fresh2 = [
        f'https://fresh-{ts2}-{random_suffix()}.example.com',
        f'https://new-{ts2}-{random_suffix()}.test.org',
        f'https://fresh-{ts2}-{random_suffix()}.mysite.net'
    ]
    for url in test_urls_fresh2:
        start = time.time()
        r = requests.post(f'{base_url}/predict/?skip_external_checks=true', json={'url': url})
        elapsed = (time.time() - start) * 1000
        skip_times.append(elapsed)
        data = r.json()
        short_url = url[:40] + '...'
        print(f'{short_url}: {elapsed:.0f}ms - {data.get("prediction", data.get("detail", "error"))}')
    print(f'Average: {sum(skip_times)/len(skip_times):.0f}ms')

    # 3. Warm up cache then test cached responses
    print('\n[3] CACHED RESPONSES (repeat calls)')
    print('-' * 40)
    # First warm up the cache
    for url in test_urls_cache:
        requests.post(f'{base_url}/predict/fast', json={'url': url})
    
    cached_times = []
    for url in test_urls_cache:
        start = time.time()
        r = requests.post(f'{base_url}/predict/fast', json={'url': url})
        elapsed = (time.time() - start) * 1000
        cached_times.append(elapsed)
        data = r.json()
        print(f'{url}: {elapsed:.0f}ms (cached) - {data.get("prediction", data.get("detail", "error"))}')
    print(f'Average: {sum(cached_times)/len(cached_times):.0f}ms')

    # 4. Test full mode (all checks enabled) with known URL
    print('\n[4] FULL MODE (all checks enabled)')
    print('-' * 40)
    test_url = 'https://amazon.com'
    start = time.time()
    r = requests.post(f'{base_url}/predict/', json={'url': test_url})
    elapsed = (time.time() - start) * 1000
    data = r.json()
    print(f'{test_url}: {elapsed:.0f}ms - {data.get("prediction", data.get("detail", "error"))}')
    if data.get('availability'):
        print(f'  - Availability: {data["availability"].get("status")}')
    if data.get('geo_analysis'):
        print(f'  - Geo blocks: {data["geo_analysis"].get("total_blocks", 0)}')

    # Summary
    print('\n' + '=' * 60)
    print('PERFORMANCE SUMMARY')
    print('=' * 60)
    print(f'Fast endpoint (fresh):    {sum(fast_times)/len(fast_times):.0f}ms (target: <150ms)')
    print(f'Skip checks (fresh):      {sum(skip_times)/len(skip_times):.0f}ms')
    print(f'Cached responses:         {sum(cached_times)/len(cached_times):.0f}ms (target: <10ms)')
    
    fast_avg = sum(fast_times)/len(fast_times)
    cached_avg = sum(cached_times)/len(cached_times)
    
    fast_met = fast_avg < 150
    cache_met = cached_avg < 10
    
    print('\n' + '=' * 60)
    print('TARGETS')
    print('=' * 60)
    print(f'Fast endpoint < 150ms:  {"✅ PASS" if fast_met else "❌ FAIL"} ({fast_avg:.0f}ms)')
    print(f'Cached < 10ms:          {"✅ PASS" if cache_met else "❌ FAIL"} ({cached_avg:.0f}ms)')
    
    if fast_met and cache_met:
        print('\n🎉 ALL PERFORMANCE TARGETS MET!')
    else:
        print('\n⚠️ Some targets not met')

if __name__ == '__main__':
    main()
