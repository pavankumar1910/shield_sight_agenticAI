"""
Input validators
"""

import re
from urllib.parse import urlparse
from typing import Tuple


class URLValidator:
    """Validate URLs before processing"""
    
    @staticmethod
    def is_valid_url(url: str) -> Tuple[bool, str]:
        """
        Check if URL is valid
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check empty
        if not url or not url.strip():
            return False, "URL cannot be empty"
        
        # Check length
        if len(url) > 2048:
            return False, "URL too long (max 2048 characters)"
        
        if len(url) < 4:
            return False, "URL too short"
        
        # Check for scheme
        if not url.startswith(('http://', 'https://')):
            return False, "URL must start with http:// or https://"
        
        # Try parsing
        try:
            parsed = urlparse(url)
            if not parsed.netloc:
                return False, "Invalid URL format: missing domain"
        except Exception:
            return False, "Invalid URL format"
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'<script',
            r'javascript:',
            r'data:',
            r'vbscript:',
        ]
        
        url_lower = url.lower()
        for pattern in suspicious_patterns:
            if re.search(pattern, url_lower):
                return False, "URL contains suspicious content"
        
        return True, ""


# Create instance
url_validator = URLValidator()