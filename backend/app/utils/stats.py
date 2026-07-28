"""
API statistics tracking
"""

from datetime import datetime
from collections import defaultdict
import threading
import time
import time
from contextlib import contextmanager


class APIStats:
    """Track API usage statistics"""
    
    def __init__(self):
        self.stats = {
            'total_requests': 0,
            'total_predictions': 0,
            'phishing_detected': 0,
            'legitimate_detected': 0,
            'errors': 0,
            'total_prediction_time': 0.0,
            'avg_prediction_time': 0.0,
            'start_time': datetime.now().isoformat()
        }
        self.lock = threading.Lock()
    
    def increment(self, key: str):
        """Increment a counter"""
        with self.lock:
            if key in self.stats:
                self.stats[key] += 1
    
    def get_stats(self) -> dict:
        """Get current statistics"""
        with self.lock:
            return self.stats.copy()
    
    def reset(self):
        """Reset statistics"""
        with self.lock:
            self.stats = {
                'total_requests': 0,
                'total_predictions': 0,
                'phishing_detected': 0,
                'legitimate_detected': 0,
                'errors': 0,
                'start_time': datetime.now().isoformat()
            }

    @contextmanager
    def time_prediction(self):
        """Context manager for timing predictions"""
        start = time.time()
        yield
        duration = time.time() - start
        self.record_prediction_time(duration)

    def record_prediction_time(self, duration: float):
        """Record prediction time"""
        with self.lock:
            self.stats['total_prediction_time'] += duration
            if self.stats['total_predictions'] > 0:
                self.stats['avg_prediction_time'] = (
                    self.stats['total_prediction_time'] / 
                    self.stats['total_predictions']
                )


# Global instance
api_stats = APIStats()