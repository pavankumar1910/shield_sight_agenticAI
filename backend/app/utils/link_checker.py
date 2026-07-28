"""
URL Availability Checker - FIXED VERSION
Checks if a URL is accessible and returns status information
"""

import requests
import time
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

def check_url_availability(url: str, timeout: int = 3) -> Dict:
    """
    Check if URL is accessible - FIXED field names
    
    Args:
        url: The URL to check
        timeout: Request timeout in seconds (default: 3)
        
    Returns:
        Dictionary with availability information (field names match models.py)
    """
    result = {
        'status': 'unknown',
        'is_accessible': None,  # ← CHANGED from 'accessible' to 'is_accessible'
        'status_code': None,
        'response_time_ms': None,  # Will be converted to int
        'ssl_valid': None,
        'ssl_details': None,
        'has_redirects': False,
        'redirect_count': 0,
        'final_url': None,
        'error_message': None,
        'server_info': None,
        'headers': {},
        'security_flags': [],
        'security_assessment': {}
    }
    
    try:
        start_time = time.time()
        
        # Make HEAD request (faster than GET)
        response = requests.head(
            url,
            timeout=timeout,
            allow_redirects=True,
            verify=True,  # Verify SSL certificate
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
            }
        )
        
        end_time = time.time()
        
        # Success - URL responded
        result['status'] = 'success'
        # Treat certain status codes as "not accessible" for risk calculation
        # 401, 403, 405 are often used by phishing precursors, but the server is definitely ONLINE
        result['is_accessible'] = response.status_code < 400 or response.status_code in (401, 403, 404, 405)
        result['status_code'] = response.status_code
        result['response_time_ms'] = int(round((end_time - start_time) * 1000))  # ← Convert to int
        result['ssl_valid'] = url.startswith('https://')
        result['has_redirects'] = len(response.history) > 0
        result['redirect_count'] = len(response.history)
        result['final_url'] = response.url if result['has_redirects'] else url
        
        # Get server information
        result['server_info'] = response.headers.get('Server', 'Unknown')
        
        # Get important headers
        result['headers'] = {
            'Content-Type': response.headers.get('Content-Type', ''),
            'Server': response.headers.get('Server', ''),
            'X-Frame-Options': response.headers.get('X-Frame-Options', ''),
            'Strict-Transport-Security': response.headers.get('Strict-Transport-Security', '')
        }
        
        # Security assessment
        security_flags = []
        if not url.startswith('https://'):
            security_flags.append('no_https')
        if 'X-Frame-Options' not in response.headers:
            security_flags.append('no_frame_protection')
        if 'Strict-Transport-Security' not in response.headers and url.startswith('https://'):
            security_flags.append('no_hsts')
            
        result['security_flags'] = security_flags
        result['security_assessment'] = {
            'threat_level': 'none' if not security_flags else 'low',
            'issues_found': len(security_flags),
            'recommendations': 'No major security threats detected' if not security_flags else 'Some security headers missing'
        }
        
        logger.debug(f"URL accessible: {url} (status: {response.status_code})")
        
    except requests.exceptions.SSLError as e:
        result['status'] = 'ssl_error'
        result['is_accessible'] = False  # ← CHANGED
        result['ssl_valid'] = False
        result['error_message'] = 'Invalid or expired SSL certificate'
        result['security_assessment'] = {
            'threat_level': 'high',
            'issues_found': 1,
            'recommendations': 'SSL certificate is invalid or expired - DO NOT VISIT'
        }
        logger.warning(f"SSL error for {url}: {str(e)[:100]}")
        
    except requests.exceptions.Timeout:
        result['status'] = 'timeout'
        result['is_accessible'] = None  # ← CHANGED
        result['error_message'] = f'Connection timeout (>{timeout}s)'
        result['security_assessment'] = {
            'threat_level': 'medium',
            'issues_found': 1,
            'recommendations': 'Website may be slow or unresponsive'
        }
        logger.warning(f"Timeout checking {url}")
        
    except requests.exceptions.ConnectionError:
        result['status'] = 'connection_error'
        result['is_accessible'] = False  # ← CHANGED
        result['error_message'] = 'Cannot connect to server (DNS failure or server down)'
        result['security_assessment'] = {
            'threat_level': 'medium',
            'issues_found': 1,
            'recommendations': 'Website may be down or domain may be suspicious'
        }
        logger.warning(f"Connection error for {url}")
        
    except requests.exceptions.TooManyRedirects:
        result['status'] = 'redirect_loop'
        result['is_accessible'] = False  # ← CHANGED
        result['error_message'] = 'Too many redirects (possible redirect loop)'
        result['security_assessment'] = {
            'threat_level': 'low',
            'issues_found': 1,
            'recommendations': 'Website has redirect configuration issues'
        }
        logger.warning(f"Redirect loop detected for {url}")
        
    except requests.exceptions.RequestException as e:
        result['status'] = 'request_error'
        result['is_accessible'] = False  # ← CHANGED
        result['error_message'] = f'Request failed: {str(e)[:100]}'
        result['security_assessment'] = {
            'threat_level': 'low',
            'issues_found': 1,
            'recommendations': 'Could not complete availability check'
        }
        logger.warning(f"Request error for {url}: {str(e)[:100]}")
        
    except Exception as e:
        result['status'] = 'error'
        result['is_accessible'] = None  # ← CHANGED
        result['error_message'] = f'Unexpected error: {str(e)[:100]}'
        result['security_assessment'] = {
            'threat_level': 'low',
            'issues_found': 1,
            'recommendations': 'Availability check encountered an error'
        }
        logger.error(f"Unexpected error checking {url}: {str(e)}")
    
    return result