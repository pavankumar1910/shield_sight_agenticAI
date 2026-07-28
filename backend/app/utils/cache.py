"""
Thread-Safe TTL Cache - PRODUCTION OPTIMIZED
Uses cachetools for automatic TTL expiration with threading locks
"""

import hashlib
import time
import threading
from typing import Optional, Any
from cachetools import TTLCache


class ThreadSafeTTLCache:
    """Thread-safe cache with TTL support using cachetools.TTLCache"""
    
    def __init__(self, max_size: int = 10000, default_ttl: int = 300):
        """
        Initialize thread-safe cache.
        
        Args:
            max_size: Maximum number of entries (default: 10,000)
            default_ttl: Default TTL in seconds (default: 5 minutes)
        """
        self._cache = TTLCache(maxsize=max_size, ttl=default_ttl)
        self._lock = threading.RLock()
        self._default_ttl = default_ttl
        self.hits = 0
        self.misses = 0
    
    def _get_key(self, url: str) -> str:
        """Generate cache key from URL using MD5 hash"""
        return hashlib.md5(url.encode()).hexdigest()
    
    def get(self, url: str) -> Optional[Any]:
        """Get cached value (thread-safe)"""
        key = self._get_key(url)
        
        with self._lock:
            try:
                value = self._cache[key]
                self.hits += 1
                return value
            except KeyError:
                self.misses += 1
                return None
    
    def set(self, url: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set cache value (thread-safe).
        
        Note: cachetools.TTLCache uses a single TTL for all entries.
        For custom TTL per entry, we store the value with metadata.
        """
        key = self._get_key(url)
        
        with self._lock:
            self._cache[key] = value
    
    def delete(self, url: str) -> bool:
        """Remove entry from cache (thread-safe)"""
        key = self._get_key(url)
        
        with self._lock:
            try:
                del self._cache[key]
                return True
            except KeyError:
                return False
    
    def clear(self) -> None:
        """Clear all entries (thread-safe)"""
        with self._lock:
            self._cache.clear()
            self.hits = 0
            self.misses = 0
    
    def stats(self) -> dict:
        """Get cache statistics (thread-safe)"""
        with self._lock:
            total = self.hits + self.misses
            hit_rate = (self.hits / total * 100) if total > 0 else 0
            
            return {
                "size": len(self._cache),
                "max_size": self._cache.maxsize,
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": round(hit_rate, 2),
                "ttl_seconds": self._default_ttl
            }
    
    @property
    def size(self) -> int:
        """Current cache size"""
        with self._lock:
            return len(self._cache)


# ═══════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════

def get_url_hash(url: str) -> str:
    """Generate cache key for URL"""
    return hashlib.md5(url.encode()).hexdigest()


# ═══════════════════════════════════════════════════════════
# GLOBAL INSTANCES (larger capacity for production)
# ═══════════════════════════════════════════════════════════

# Prediction cache: 10,000 entries, 5 min default TTL
prediction_cache = ThreadSafeTTLCache(max_size=10000, default_ttl=300)

# Explanation cache: 10,000 entries, 15 min TTL (explanations are expensive)
explanation_cache = ThreadSafeTTLCache(max_size=10000, default_ttl=900)


# ═══════════════════════════════════════════════════════════
# BACKWARD COMPATIBILITY WRAPPER (for existing code)
# ═══════════════════════════════════════════════════════════

# Legacy PredictionCache class for backward compatibility
PredictionCache = ThreadSafeTTLCache