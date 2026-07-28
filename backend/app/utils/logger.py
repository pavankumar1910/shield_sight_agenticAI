"""
Logging configuration
"""

import logging
import sys
from datetime import datetime
from pathlib import Path


def setup_logging(log_level=logging.INFO):
    """
    Setup application logging
    
    Creates:
    - Console handler (colored output)
    - File handler (logs/api.log)
    """
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create formatter
    log_format = '%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s'
    formatter = logging.Formatter(log_format, datefmt='%Y-%m-%d %H:%M:%S')
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # File handler (rotating)
    file_handler = logging.FileHandler(
        log_dir / f"api_{datetime.now().strftime('%Y%m%d')}.log"
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Suppress noisy loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    
    return root_logger


# Initialize on import
logger = setup_logging()