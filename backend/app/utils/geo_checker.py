"""
Geo-blocking and Proxy Detection
Detects if URL is blocked in specific countries or using proxy
"""

import asyncio
import socket
import logging
import requests
from typing import Dict, List, Optional
from urllib.parse import urlparse

try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False

logger = logging.getLogger(__name__)

class GeoProxyChecker:
    """Check geo-blocking and proxy status"""
    
    # Known blocked domains by country
    BLOCKED_DOMAINS = {
        'China': ['google.com', 'facebook.com', 'twitter.com', 'youtube.com', 'instagram.com', 'whatsapp.com', 'telegram.org', 'reddit.com'],
        'Russia': ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'],
        'Iran': ['facebook.com', 'twitter.com', 'youtube.com', 'instagram.com', 'telegram.org', 'whatsapp.com'],
        'North Korea': ['google.com', 'facebook.com', 'twitter.com', 'youtube.com'],
        'Turkey': ['twitter.com', 'wikipedia.org'],
        'UAE': ['skype.com', 'whatsapp.com'],
        'India': ['tiktok.com', 'pubg.com']
    }
    
    # Proxy/VPN indicators
    PROXY_KEYWORDS = ['proxy', 'vpn', 'anonymizer', 'hide', 'mask', 'tunnel', 'bypass', 'unblock']
    
    @staticmethod
    async def check_ip_geolocation(url: str) -> Dict:
        """Get IP geolocation with fallback and diagnostic prints"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc or parsed.path
            domain = domain.split(':')[0]
            
            print(f"--- DEBUG GEO START: {domain} ---")
            
            # Resolve domain to IP first (in a thread to avoid blocking)
            try:
                ip = await asyncio.to_thread(socket.gethostbyname, domain)
                print(f"Resolved {domain} to {ip}")
            except Exception as e:
                print(f"DNS Resolution failed for {domain}: {e}")
                return {'ip': None, 'country': 'Unknown', 'error': f'DNS failure: {e}'}
            
            # Try GeoJS First (in a thread)
            try:
                print(f"Querying GeoJS for {ip}...")
                def query_geojs():
                    return requests.get(f'https://get.geojs.io/v1/ip/geo/{ip}.json', timeout=5)
                
                response = await asyncio.to_thread(query_geojs)
                if response.status_code == 200:
                    data = response.json()
                    print(f"GeoJS Result: {data.get('country')}")
                    if data.get('country'):
                        return {
                            'ip': data.get('ip', ip),
                            'country': data.get('country', 'Unknown'),
                            'country_code': data.get('country_code', ''),
                            'region': data.get('region', 'Unknown'),
                            'city': data.get('city', 'Unknown'),
                            'isp': data.get('organization_name') or data.get('organization', 'Unknown'),
                            'timezone': data.get('timezone', 'Unknown'),
                            'is_proxy': False,
                            'is_hosting': False,
                        }
            except Exception as geojs_err:
                print(f"GeoJS query failed: {geojs_err}")

            # Fallback to ip-api.com (in a thread)
            try:
                print(f"Querying ip-api.com for {ip}...")
                def query_ipapi():
                    return requests.get(f'http://ip-api.com/json/{ip}', timeout=5)
                
                response = await asyncio.to_thread(query_ipapi)
                if response.status_code == 200:
                    data = response.json()
                    print(f"ip-api Result: {data.get('country')}")
                    if data.get('status') == 'success':
                        return {
                            'ip': data.get('query', ip),
                            'country': data.get('country', 'Unknown'),
                            'country_code': data.get('countryCode', ''),
                            'region': data.get('regionName', 'Unknown'),
                            'city': data.get('city', 'Unknown'),
                            'isp': data.get('isp', 'Unknown'),
                            'timezone': data.get('timezone', 'Unknown'),
                            'is_proxy': False,
                            'is_hosting': False,
                        }
            except Exception as ipapi_err:
                print(f"ip-api query failed: {ipapi_err}")

        except Exception as e:
            print(f"Critical Geolocation failure: {e}")
            logger.warning(f"Geolocation check failed: {e}")
        
        print("--- DEBUG GEO END: FAILED ---")
        return {
            'ip': None,
            'country': 'Unknown',
            'error': 'Geolocation unavailable'
        }
    
    @staticmethod
    def check_blocked_countries(url: str) -> List[Dict]:
        """Check which countries block this domain"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc or parsed.path
            base_domain = domain.replace('www.', '').split(':')[0]
            
            blocked_in = []
            for country, blocked_list in GeoProxyChecker.BLOCKED_DOMAINS.items():
                for blocked_domain in blocked_list:
                    # Precise matching to avoid '.com' matching 'leetcode.com'
                    if base_domain == blocked_domain or base_domain.endswith('.' + blocked_domain):
                        blocked_in.append({
                            'country': country,
                            'reason': GeoProxyChecker._get_block_reason(country, base_domain)
                        })
                        break
            return blocked_in
        except Exception as e:
            logger.error(f"Blocked countries check failed: {e}")
            return []
    
    @staticmethod
    def _get_block_reason(country: str, domain: str) -> str:
        """Get reason for blocking"""
        reasons = {
            'China': 'Blocked by Great Firewall (????)',
            'Russia': 'Blocked due to government restrictions',
            'Iran': 'Blocked by government censorship',
            'North Korea': 'Internet access heavily restricted',
            'Turkey': 'Blocked by government order',
            'UAE': 'Blocked due to local regulations',
            'India': 'Banned by government (security concerns)'
        }
        return reasons.get(country, 'Government censorship')
    
    @staticmethod
    def detect_proxy_indicators(url: str) -> Dict:
        """Detect if URL is proxy/VPN related"""
        try:
            url_lower = url.lower()
            detected_keywords = [k for k in GeoProxyChecker.PROXY_KEYWORDS if k in url_lower]
            is_proxy = len(detected_keywords) > 0
            proxy_domains = ['proxysit', 'hidemyass', 'nordvpn', 'expressvpn', 'protonvpn', 'vpngate', 'anonymouse', 'hide.me']
            is_proxy_domain = any(pd in url_lower for pd in proxy_domains)
            
            return {
                'is_proxy_url': is_proxy or is_proxy_domain,
                'confidence': 'high' if is_proxy_domain else 'medium' if is_proxy else 'low',
                'detected_keywords': detected_keywords,
                'type': 'VPN/Proxy Service' if is_proxy_domain else 'Proxy Keywords Detected' if is_proxy else None
            }
        except Exception as e:
            return {'is_proxy_url': False}
    
    @staticmethod
    async def full_geo_analysis(url: str) -> Dict:
        """Complete geo and proxy analysis"""
        try:
            geo_info, blocked_countries, proxy_info = await asyncio.gather(
                GeoProxyChecker.check_ip_geolocation(url),
                asyncio.to_thread(GeoProxyChecker.check_blocked_countries, url),
                asyncio.to_thread(GeoProxyChecker.detect_proxy_indicators, url),
                return_exceptions=True
            )
            
            if isinstance(geo_info, Exception): geo_info = {'error': str(geo_info)}
            if isinstance(blocked_countries, Exception): blocked_countries = []
            if isinstance(proxy_info, Exception): proxy_info = {'is_proxy_url': False}
            
            return {
                'geolocation': geo_info,
                'blocked_in_countries': blocked_countries,
                'proxy_detection': proxy_info,
                'is_geo_restricted': len(blocked_countries) > 0,
                'total_blocks': len(blocked_countries)
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'geolocation': {},
                'blocked_in_countries': [],
                'proxy_detection': {'is_proxy_url': False}
            }
