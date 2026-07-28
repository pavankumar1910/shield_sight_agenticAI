"""
QR Code Decoder Utility
Extracts URLs from QR code images
"""

try:
    import cv2
    import numpy as np
    from PIL import Image
    QR_ENABLED = True
except Exception as e:
    QR_ENABLED = False
    print(f"WARNING: QR decoding engine (OpenCV) initialization failure: {e}")
    cv2 = None
    np = None
    Image = None

from typing import List, Dict, Optional, Tuple
import logging
import base64
import io
import requests
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class QRDecoder:
    """Decode QR codes from images and extract URLs"""
    
    SHORTENER_DOMAINS = {
        'qrco.de', 'bit.ly', 'tinyurl.com', 't.co',
        'goo.gl', 'is.gd', 'cutt.ly', 'rebrand.ly',
        'ow.ly', 'buff.ly', 'adf.ly', 'bc.vc',
        'tiny.cc', 'lc.chat', 'rb.gy'
    }
    
    @staticmethod
    def is_shortened_url(url: str) -> bool:
        """Check if URL uses a shortener service"""
        try:
            domain = urlparse(url).netloc.lower().replace('www.', '')
            return any(domain.endswith(shortener) or domain == shortener 
                      for shortener in QRDecoder.SHORTENER_DOMAINS)
        except Exception:
            return False
    
    @staticmethod
    def expand_url(url: str, timeout: int = 5) -> Tuple[str, List[str]]:
        """
        Expand shortened URL to final destination
        
        Returns:
            (final_url, redirect_chain)
        """
        try:
            response = requests.head(
                url,
                allow_redirects=True,
                timeout=timeout,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            
            # Build redirect chain
            redirect_chain = []
            if hasattr(response, 'history') and response.history:
                redirect_chain = [r.url for r in response.history]
            
            final_url = response.url if response.url else url
            return final_url, redirect_chain
            
        except Exception as e:
            logger.warning(f"URL expansion failed for {url}: {e}")
            return url, []
    
    @staticmethod
    def _calculate_quality_cv(bbox) -> str:
        """Calculate quality based on OpenCV bbox size"""
        if bbox is None or len(bbox) == 0:
            return 'low'
        
        try:
            # bbox usually (4, 2) for a single QR in the multi zip
            points = np.array(bbox, dtype=np.float32)
            width = np.linalg.norm(points[0] - points[1])
            height = np.linalg.norm(points[1] - points[2])
            size = width * height
            
            if size > 10000:
                return 'high'
            elif size > 3000:
                return 'medium'
            return 'low'
        except:
            return 'medium'
    
    @staticmethod
    def decode_from_base64(base64_image: str) -> List[Dict]:
        """
        Decode QR codes from base64 image string using OpenCV
        """
        if not QR_ENABLED:
            logger.warning("QR Decoding requested but OpenCV initialization failed.")
            return []

        try:
            # Remove data URL prefix if present
            if 'base64,' in base64_image:
                base64_image = base64_image.split('base64,')[1]
            
            # Decode base64 to image
            image_data = base64.b64decode(base64_image)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to OpenCV BGR format
            img_rgb = np.array(image.convert('RGB'))
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
            
            # Use OpenCV QRCodeDetector
            detector = cv2.QRCodeDetector()
            success, decoded_info, points, _ = detector.detectAndDecodeMulti(img_bgr)
            
            results = []
            if success:
                for data, bbox in zip(decoded_info, points):
                    if not data:
                        continue
                        
                    # Clean/Format data
                    data = data.strip()
                    if not data.startswith(('http://', 'https://', 'www.')):
                        # Only take URLs
                        continue
                    
                    # Calculate bounding rect
                    x_min = int(np.min(bbox[:, 0]))
                    y_min = int(np.min(bbox[:, 1]))
                    width = int(np.max(bbox[:, 0]) - x_min)
                    height = int(np.max(bbox[:, 1]) - y_min)
                    
                    results.append({
                        'data': data,
                        'type': 'QRCODE',
                        'quality': QRDecoder._calculate_quality_cv(bbox),
                        'rect': {
                            'x': x_min,
                            'y': y_min,
                            'width': width,
                            'height': height
                        }
                    })
            
            if not results:
                logger.info("No URL QR codes found in image")
                
            return results
            
        except Exception as e:
            logger.error(f"QR decoding error: {str(e)}")
            return []
    
    @staticmethod
    def validate_qr_image(image_data: bytes) -> bool:
        """Validate if image is valid and contains QR code"""
        try:
            image = Image.open(io.BytesIO(image_data))
            # Check size
            if image.size[0] < 50 or image.size[1] < 50:
                return False
            # Check format
            if image.format not in ['PNG', 'JPEG', 'JPG', 'WEBP']:
                return False
            return True
        except Exception:
            return False