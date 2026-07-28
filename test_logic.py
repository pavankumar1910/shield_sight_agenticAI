
import re
from urllib.parse import urlparse

# Copying the logic from predict.py to verify it works
HIGH_TRUST_DOMAINS = {
    'google.com', 'paypal.com', 'microsoft.com', 'amazon.com'
}

PHISHING_KEYWORDS = {
    'login', 'verify', 'secure', 'account'
}

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

def analyze_domain_risk(url: str):
    try:
        parsed = urlparse(url.lower())
        netloc = parsed.netloc if parsed.netloc else parsed.path
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        if '/' in netloc:
            netloc = netloc.split('/')[0]
        if not netloc or '.' not in netloc:
            return False, "invalid_domain_format", 0.0
        
        if netloc in HIGH_TRUST_DOMAINS:
            return True, "exact_domain_match", 0.3
        
        # Typosquatting
        if len(netloc) > 4:
            for trusted in HIGH_TRUST_DOMAINS:
                if abs(len(netloc) - len(trusted)) > 2:
                    continue
                dist = levenshtein_distance(netloc, trusted)
                if 0 < dist <= 2:
                    return False, f"typosquatting_detected_target_{trusted}", -0.8
        
        return False, "not_whitelisted", 0.0
    except Exception as e:
        return False, f"parse_error: {e}", 0.0

def test():
    test_cases = [
        ("https://www.gogle.com", "phishing"),
        ("https://www.google.com", "legitimate"),
        ("https://www.paypa1.com", "phishing"),
        ("https://paypal.com", "legitimate")
    ]
    
    print("🧪 Running isolated logic test...")
    for url, expected in test_cases:
        is_white, reason, boost = analyze_domain_risk(url)
        prediction = "phishing" if "typosquatting" in reason or not is_white else "legitimate"
        print(f"URL: {url}")
        print(f"  Reason: {reason}")
        print(f"  Result: {prediction} (Expected: {expected})")
        if (prediction == expected):
            print("  ✅ Pass")
        else:
            print("  ❌ FAIL")

if __name__ == "__main__":
    test()
