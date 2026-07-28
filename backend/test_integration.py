"""
Integration test suite for ShieldSight API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []
    
    def add_result(self, name, passed, message=""):
        self.tests.append({
            'name': name,
            'passed': passed,
            'message': message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_summary(self):
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"Success Rate: {self.passed/(self.passed+self.failed)*100:.1f}%")
        
        if self.failed > 0:
            print("\n❌ Failed Tests:")
            for test in self.tests:
                if not test['passed']:
                    print(f"  - {test['name']}: {test['message']}")


def test_health_check(results):
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        passed = response.status_code == 200 and response.json().get('model_loaded') == True
        results.add_result("Health Check", passed, 
                          "" if passed else f"Status: {response.status_code}")
    except Exception as e:
        results.add_result("Health Check", False, str(e))


def test_single_prediction(results):
    """Test single prediction"""
    try:
        response = requests.post(
            f"{BASE_URL}/predict/",
            json={"url": "http://paypal-secure.com/login"}
        )
        result = response.json()
        passed = (
            response.status_code == 200 and
            'prediction' in result and
            'confidence' in result
        )
        results.add_result("Single Prediction", passed,
                          "" if passed else f"Response: {result}")
    except Exception as e:
        results.add_result("Single Prediction", False, str(e))


def test_batch_prediction(results):
    """Test batch prediction"""
    try:
        response = requests.post(
            f"{BASE_URL}/predict/batch",
            json={
                "urls": [
                    "http://test1.com",
                    "http://test2.com",
                    "http://test3.com"
                ]
            }
        )
        result = response.json()
        passed = (
            response.status_code == 200 and
            result.get('total') == 3 and
            'results' in result
        )
        results.add_result("Batch Prediction", passed,
                          "" if passed else f"Response: {result}")
    except Exception as e:
        results.add_result("Batch Prediction", False, str(e))


def test_explanation(results):
    """Test explanation endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/predict/explain",
            json={"url": "http://phishing-test.com"}
        )
        result = response.json()
        passed = (
            response.status_code == 200 and
            'top_features' in result and
            len(result['top_features']) > 0
        )
        results.add_result("Explanation", passed,
                          "" if passed else f"Response: {result}")
    except Exception as e:
        results.add_result("Explanation", False, str(e))


def test_invalid_url(results):
    """Test invalid URL handling"""
    try:
        response = requests.post(
            f"{BASE_URL}/predict/",
            json={"url": "not-a-valid-url"}
        )
        passed = response.status_code == 400
        results.add_result("Invalid URL Handling", passed,
                          "" if passed else f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_result("Invalid URL Handling", False, str(e))


def test_stats_endpoint(results):
    """Test statistics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/stats")
        result = response.json()
        passed = (
            response.status_code == 200 and
            'total_requests' in result
        )
        results.add_result("Statistics Endpoint", passed,
                          "" if passed else f"Response: {result}")
    except Exception as e:
        results.add_result("Statistics Endpoint", False, str(e))


def test_model_info(results):
    """Test model info endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/model/info")
        result = response.json()
        passed = (
            response.status_code == 200 and
            result.get('num_features') == 50
        )
        results.add_result("Model Info", passed,
                          "" if passed else f"Response: {result}")
    except Exception as e:
        results.add_result("Model Info", False, str(e))


def main():
    print("=" * 60)
    print("🧪 SHIELDSIGHT API INTEGRATION TESTS")
    print("=" * 60)
    print(f"Target: {BASE_URL}")
    print("=" * 60)
    
    results = TestResults()
    
    # Run all tests
    tests = [
        ("Health Check", test_health_check),
        ("Single Prediction", test_single_prediction),
        ("Batch Prediction", test_batch_prediction),
        ("Explanation", test_explanation),
        ("Invalid URL Handling", test_invalid_url),
        ("Statistics Endpoint", test_stats_endpoint),
        ("Model Info", test_model_info),
    ]
    
    for i, (name, test_func) in enumerate(tests, 1):
        print(f"\n{i}️⃣  Running: {name}")
        test_func(results)
        time.sleep(0.1)  # Small delay between tests
    
    # Print summary
    results.print_summary()
    
    print("\n" + "=" * 60)
    print("✅ INTEGRATION TESTS COMPLETE!")
    print("=" * 60)
    
    return results.failed == 0


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)