import json
import pandas as pd
from collections import Counter

def analyze_false_positives(results_file):
    """Analyze false positive patterns"""
    
    with open(results_file) as f:
        results = json.load(f)
    
    fps = results['false_positives']
    
    if not fps:
        print("✅ No false positives found!")
        return
    
    # Extract domains
    domains = [fp['url'].split('/')[2] for fp in fps]
    
    # Analyze TLDs
    tlds = [d.split('.')[-1] for d in domains]
    tld_counts = Counter(tlds)
    
    print("\n📊 FALSE POSITIVE ANALYSIS")
    print("="*60)
    print(f"\nTotal False Positives: {len(fps)}")
    print(f"False Positive Rate: {results['false_positive_rate']:.2f}%")
    
    print(f"\n🌐 Top TLDs in False Positives:")
    for tld, count in tld_counts.most_common(10):
        print(f"   .{tld}: {count} ({count/len(fps)*100:.1f}%)")
    
    # Analyze confidence scores
    confidences = [fp['confidence'] for fp in fps]
    avg_confidence = sum(confidences) / len(confidences)
    
    print(f"\n📈 Confidence Statistics:")
    print(f"   Average: {avg_confidence:.2%}")
    print(f"   Min: {min(confidences):.2%}")
    print(f"   Max: {max(confidences):.2%}")
    
    # Find domains to whitelist
    print(f"\n✅ Domains to Add to Whitelist:")
    for fp in sorted(fps, key=lambda x: x['confidence'], reverse=True)[:20]:
        domain = fp['url'].split('/')[2]
        print(f"   {domain} (confidence: {fp['confidence']:.2%})")

if __name__ == "__main__":
    analyze_false_positives("alexa_validation_results.json")