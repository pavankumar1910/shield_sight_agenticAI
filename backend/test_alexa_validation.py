import os
import pandas as pd
import requests
import time
from tqdm import tqdm
import json

API_URL = "http://localhost:8000"

# -----------------------------
# PATH CONFIG (FIXED)
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "data", "raw", "top-1m.csv")


def load_alexa_urls(filepath, n=1000):
    """Load top N URLs from Alexa/Tranco list"""
    df = pd.read_csv(filepath, header=None, names=["rank", "domain"])
    return [f"https://{domain}" for domain in df["domain"].head(n)]


def test_url(url):
    """Test single URL"""
    try:
        response = requests.post(
            f"{API_URL}/predict/",
            json={"url": url},
            timeout=10
        )
        if response.status_code == 200:
            return response.json()
        return None
    except Exception:
        return None


def run_validation(urls, output_file="alexa_validation_results.json"):
    """Run validation on all URLs"""
    results = {
        "total": len(urls),
        "successful": 0,
        "failed": 0,
        "phishing_detected": 0,
        "legitimate_detected": 0,
        "false_positives": [],
        "errors": [],
        "details": []
    }

    print(f"\n🔍 Testing {len(urls)} legitimate URLs...")

    for url in tqdm(urls):
        result = test_url(url)

        if result:
            results["successful"] += 1
            results["details"].append({
                "url": url,
                "prediction": result["prediction"],
                "confidence": result["confidence"],
                "risk_level": result["risk_level"]
            })

            if result["prediction"] == "phishing":
                results["phishing_detected"] += 1
                results["false_positives"].append({
                    "url": url,
                    "confidence": result["confidence"],
                    "risk_level": result["risk_level"]
                })
            else:
                results["legitimate_detected"] += 1
        else:
            results["failed"] += 1
            results["errors"].append(url)

        time.sleep(0.1)  # rate limiting

    # Metrics
    results["false_positive_rate"] = (
        results["phishing_detected"] / results["successful"] * 100
        if results["successful"] else 0
    )

    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)

    return results


def print_summary(results):
    """Print validation summary"""
    print("\n" + "=" * 60)
    print("📊 ALEXA / TRANCO VALIDATION RESULTS")
    print("=" * 60)

    print(f"\n✅ Total URLs Tested: {results['total']}")
    print(f"✅ Successful Tests: {results['successful']}")
    print(f"❌ Failed Tests: {results['failed']}")

    print("\n📈 PREDICTIONS:")
    print(f"   Legitimate: {results['legitimate_detected']} "
          f"({results['legitimate_detected']/results['successful']*100:.1f}%)")
    print(f"   Phishing: {results['phishing_detected']} "
          f"({results['phishing_detected']/results['successful']*100:.1f}%)")

    print(f"\n🎯 FALSE POSITIVE RATE: {results['false_positive_rate']:.2f}%")

    if results["false_positive_rate"] < 5:
        print("   ✅ EXCELLENT (< 5%)")
    elif results["false_positive_rate"] < 10:
        print("   ⚠️ ACCEPTABLE (5–10%)")
    else:
        print("   ❌ NEEDS IMPROVEMENT (> 10%)")

    if results["false_positives"]:
        print("\n❌ Top 10 False Positives:")
        for fp in results["false_positives"][:10]:
            print(f"   - {fp['url']} (confidence: {fp['confidence']:.2%})")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    print("📥 Loading Alexa/Tranco URLs...")
    print("📄 CSV Path:", CSV_PATH)

    urls = load_alexa_urls(CSV_PATH, n=1000)

    results = run_validation(urls)
    print_summary(results)

    print("\n💾 Detailed results saved to: alexa_validation_results.json")
