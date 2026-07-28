# 🛡️ ShieldSight - Complete Project Documentation

> **Enterprise-Grade AI-Powered Phishing Detection System**  
> Version 1.0 | Last Updated: January 2026

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Features Overview](#4-features-overview)
5. [Single URL Analysis](#5-single-url-analysis)
6. [Batch URL Processing](#6-batch-url-processing)
7. [QR Code Scanner](#7-qr-code-scanner)
8. [Document Scanner](#8-document-scanner)
9. [Email Scanner](#9-email-scanner)
10. [Dashboard & Analytics](#10-dashboard--analytics)
11. [Machine Learning Model](#11-machine-learning-model)
12. [API Reference](#12-api-reference)
13. [Security Features](#13-security-features)
14. [Performance Optimization](#14-performance-optimization)
15. [Deployment Guide](#15-deployment-guide)
16. [Chrome Extension](#16-chrome-extension)

---

## 1. Project Overview

### 1.1 What is ShieldSight?

ShieldSight is an advanced, enterprise-grade phishing detection platform that uses **XGBoost machine learning** combined with **SHAP (SHapley Additive exPlanations)** for transparent, explainable AI predictions. The system analyzes URLs across multiple vectors to identify phishing attempts with **95.2% accuracy** and a **<5% false positive rate**.

### 1.2 Key Highlights

| Metric | Value |
|--------|-------|
| **Accuracy** | 95.2% |
| **Precision** | 95.1% |
| **Recall** | 95.3% |
| **F1-Score** | 95.2% |
| **False Positive Rate** | 3.75% (Alexa Top-1M validated) |
| **Response Time (Fast Mode)** | ~140ms |
| **Response Time (Cached)** | ~4ms |
| **Batch Capacity** | 100 URLs/request |

### 1.3 Problem Statement

Phishing attacks remain one of the most prevalent cyber threats, with over **3.4 billion phishing emails sent daily**. Traditional blacklist-based approaches fail to detect new, zero-day phishing sites. ShieldSight addresses this by:

- Using **ML-based analysis** that doesn't rely on blacklists
- Providing **explainable AI** so users understand why a URL is flagged
- Supporting **multiple input vectors** (URL, QR, documents, emails)
- Offering **real-time protection** with sub-second response times

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  React Frontend (Vercel)  │  Chrome Extension  │  Mobile PWA        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
├─────────────────────────────────────────────────────────────────────┤
│  FastAPI Backend (Railway)                                           │
│  - GZip Compression                                                  │
│  - CORS Middleware                                                   │
│  - Rate Limiting                                                     │
│  - Request Logging                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PROCESSING LAYER                               │
├───────────────┬───────────────┬───────────────┬─────────────────────┤
│ URL Validator │ Feature       │ ML Model      │ SHAP Explainer      │
│               │ Extractor     │ (XGBoost)     │                     │
├───────────────┼───────────────┼───────────────┼─────────────────────┤
│ QR Decoder    │ Document      │ Geo Checker   │ Threat Calculator   │
│ (pyzbar)      │ Parser        │               │                     │
└───────────────┴───────────────┴───────────────┴─────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  TTL Cache (10,000 entries)  │  Firebase (Auth)  │  Local Storage   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Input → Validation → Feature Extraction → ML Prediction → 
SHAP Analysis → Availability Check → Geo Analysis → Response
```

---

## 3. Technology Stack

### 3.1 Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | FastAPI | 0.104.1 |
| Runtime | Python | 3.9+ |
| ML Model | XGBoost | 2.0.3 |
| Explainability | SHAP | 0.43.0 |
| Data Processing | Pandas, NumPy | 2.0.3, 1.24.3 |
| QR Decoding | pyzbar, OpenCV | Latest |
| Document Parsing | PyPDF2, python-docx | Latest |
| Server | Uvicorn | 0.24.0 |
| Caching | cachetools | 5.3+ |

### 3.2 Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.2 |
| Language | TypeScript | 5.0 |
| Styling | Tailwind CSS | 3.3 |
| Animations | Framer Motion | 10.x |
| Charts | Recharts | 2.x |
| State | Zustand | 4.x |
| Build Tool | Vite | 4.x |
| PDF Export | jsPDF, html2canvas | Latest |

### 3.3 Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Backend Hosting | Railway | API Server |
| Frontend Hosting | Vercel | Static Site |
| Authentication | Firebase | User Auth |
| Domain | Custom | DNS Management |

---

## 4. Features Overview

### 4.1 Feature Matrix

| Feature | Description | Status |
|---------|-------------|--------|
| Single URL Analysis | Analyze individual URLs with full SHAP explanation | ✅ Complete |
| Batch Processing | Analyze up to 100 URLs simultaneously | ✅ Complete |
| QR Code Scanner | Decode and analyze URLs from QR codes | ✅ Complete |
| Document Scanner | Extract and analyze URLs from PDF/DOCX/TXT | ✅ Complete |
| Email Scanner | Parse emails and scan embedded URLs | ✅ Complete |
| History Tracking | Auto-save and review past scans | ✅ Complete |
| Dashboard Analytics | Real-time statistics and visualizations | ✅ Complete |
| Dark/Light Theme | Full theme support | ✅ Complete |
| PDF/CSV Export | Download analysis reports | ✅ Complete |
| Chrome Extension | Browser-based real-time protection | ✅ Complete |
| Geo-Blocking Detection | Identify region-restricted sites | ✅ Complete |
| SSL Validation | Verify certificate validity | ✅ Complete |

---

## 5. Single URL Analysis

### 5.1 Overview

The core feature of ShieldSight - analyze any URL to determine if it's a phishing attempt or legitimate site.

### 5.2 Analysis Process

```
1. URL Validation
   └─ Check format, normalize, validate accessibility

2. Feature Extraction (30+ features)
   ├─ URL Length, Domain Length
   ├─ Character distribution (letters, digits, special)
   ├─ Keyword detection (login, verify, secure, etc.)
   ├─ TLD analysis (suspicious: .tk, .xyz, .buzz)
   ├─ IP address detection
   ├─ Subdomain analysis
   └─ URL shortener detection

3. Domain Intelligence
   ├─ Whitelist check (Google, Amazon, etc.)
   ├─ Typosquatting detection (g00gle.com)
   └─ Domain reputation boost

4. ML Prediction
   ├─ XGBoost model inference
   └─ Probability calculation

5. SHAP Explanation
   ├─ Feature importance ranking
   └─ Contribution visualization

6. Availability Check
   ├─ HTTP status code
   ├─ Response time
   ├─ SSL certificate validation
   └─ Redirect detection

7. Geo Analysis
   ├─ Server location
   ├─ Blocked countries
   └─ Proxy detection
```

### 5.3 API Endpoint

```http
POST /predict/
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**Query Parameters:**
- `include_explanation` (bool, default: true) - Include SHAP explanation
- `skip_external_checks` (bool, default: false) - Skip availability/geo checks for speed

### 5.4 Response Structure

```json
{
  "url": "https://example.com",
  "prediction": "legitimate",
  "confidence": 0.95,
  "phishing_probability": 0.05,
  "legitimate_probability": 0.95,
  "risk_level": "very_low",
  "summary": "✓ This URL appears safe with 95.0% confidence.",
  "availability": {
    "is_accessible": true,
    "status_code": 200,
    "response_time_ms": 145,
    "ssl_valid": true
  },
  "geo_analysis": {
    "geolocation": {
      "country": "United States",
      "city": "Mountain View"
    },
    "blocked_in_countries": [],
    "is_geo_restricted": false
  },
  "threat_index": 15,
  "threat_level": "LOW",
  "metadata": {
    "processing_time_ms": 142,
    "from_cache": false,
    "model_version": "shield_sight_compatible_v1.0"
  }
}
```

### 5.5 Risk Levels

| Level | Confidence Range | Action |
|-------|------------------|--------|
| **very_low** | ≥95% legitimate | Safe to visit |
| **low** | ≥85% legitimate | Generally safe |
| **caution** | ≥70% legitimate | Proceed with care |
| **warning** | <70% legitimate | Be careful |
| **medium** | ≥60% phishing | Suspicious |
| **high** | ≥75% phishing | Likely dangerous |
| **critical** | ≥90% phishing | Definitely phishing |

---

## 6. Batch URL Processing

### 6.1 Overview

Analyze multiple URLs simultaneously - perfect for security audits, content moderation, or bulk link verification.

### 6.2 Features

- **Capacity**: Up to 100 URLs per request
- **Input Methods**: 
  - Manual entry (paste URLs)
  - File upload (TXT, CSV)
- **Parallel Processing**: Concurrent analysis for speed
- **Export**: CSV download of results

### 6.3 API Endpoint

```http
POST /predict/batch
Content-Type: application/json

{
  "urls": [
    "https://google.com",
    "http://paypal-secure.tk",
    "https://github.com"
  ]
}
```

### 6.4 Response Structure

```json
{
  "total": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {
      "url": "https://google.com",
      "prediction": "legitimate",
      "confidence": 0.98,
      "risk_level": "very_low"
    },
    {
      "url": "http://paypal-secure.tk",
      "prediction": "phishing",
      "confidence": 0.92,
      "risk_level": "critical"
    }
  ],
  "processing_time_ms": 1250
}
```

### 6.5 File Upload Format

**TXT File:**
```
https://example1.com
https://example2.com
http://suspicious-site.tk
```

**CSV File:**
```csv
url
https://example1.com
https://example2.com
```

---

## 7. QR Code Scanner

### 7.1 Overview

Decode QR codes from images and analyze embedded URLs for phishing threats. Critical for detecting QR-based phishing (quishing) attacks.

### 7.2 Features

- **Camera Capture**: Use device camera to scan QR codes
- **Image Upload**: Upload QR code images (PNG, JPG, GIF)
- **URL Expansion**: Automatically expand shortened URLs (bit.ly, tinyurl, etc.)
- **Multiple QR Support**: Detect multiple QR codes in single image
- **Quality Assessment**: Report QR code quality (high/medium/low)

### 7.3 Supported URL Shorteners

- bit.ly, tinyurl.com, t.co, goo.gl
- is.gd, cutt.ly, rebrand.ly, ow.ly
- buff.ly, adf.ly, tiny.cc, rb.gy
- qrco.de, lc.chat

### 7.4 API Endpoint

```http
POST /predict/qr-scan
Content-Type: application/json

{
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```

### 7.5 Response Structure

```json
[
  {
    "url": "https://example.com",
    "original_url": "https://bit.ly/abc123",
    "final_url": "https://example.com",
    "prediction": "legitimate",
    "confidence": 0.92,
    "qr_metadata": {
      "decoded_url": "https://bit.ly/abc123",
      "quality": "high",
      "redirect_chain": [
        "https://bit.ly/abc123",
        "https://example.com"
      ]
    }
  }
]
```

### 7.6 Workflow

```
1. Image Input (Camera/Upload)
        │
        ▼
2. QR Code Detection (pyzbar)
        │
        ▼
3. URL Extraction
        │
        ▼
4. URL Expansion (if shortened)
        │
        ▼
5. Phishing Analysis
        │
        ▼
6. Results Display + PDF Export
```

---

## 8. Document Scanner

### 8.1 Overview

Extract and analyze all URLs embedded in documents. Supports PDF, DOCX, and TXT files up to 10MB.

### 8.2 Supported Formats

| Format | Extension | Max Size |
|--------|-----------|----------|
| PDF | .pdf | 10 MB |
| Word | .docx, .doc | 10 MB |
| Text | .txt | 10 MB |

### 8.3 Extraction Capabilities

**PDF Files:**
- Text content extraction (pdfplumber + PyPDF2)
- Page number tracking
- Context extraction (surrounding text)

**DOCX Files:**
- Paragraph text extraction
- Embedded hyperlinks
- Paragraph number tracking

**TXT Files:**
- Line-by-line extraction
- Line number tracking

### 8.4 API Endpoint

```http
POST /predict/document-scan
Content-Type: multipart/form-data

file: [document.pdf]
```

### 8.5 Response Structure

```json
{
  "file_name": "invoice.pdf",
  "file_type": "pdf",
  "urls_found": 5,
  "phishing_detected": 1,
  "safe_urls": 4,
  "results": [
    {
      "url": "https://payment.example.com",
      "prediction": "phishing",
      "confidence": 0.89,
      "risk_level": "high",
      "document_metadata": {
        "page": 2,
        "context": "Click here to verify your payment"
      }
    }
  ],
  "document_info": {
    "total_pages": 5,
    "extraction_method": "pdfplumber"
  }
}
```

### 8.6 Use Cases

- **Invoice Verification**: Check payment links in invoices
- **Contract Review**: Verify links in legal documents
- **Content Moderation**: Scan user-uploaded documents
- **Security Audits**: Bulk document scanning

---

## 9. Email Scanner

### 9.1 Overview

Parse suspicious emails and automatically extract and analyze all embedded URLs. Perfect for verifying email authenticity and detecting phishing attempts.

### 9.2 Features

- **Automatic URL Extraction**: Regex-based URL detection
- **Batch Analysis**: Analyze all extracted URLs
- **Sample Emails**: Pre-loaded phishing and legitimate samples
- **Visual Results**: Color-coded threat indicators

### 9.3 URL Extraction Pattern

```regex
(https?:\/\/[^\s<>"{}|\\^`\[\]]+)
```

Handles:
- HTTP and HTTPS URLs
- Query parameters
- Path segments
- Trailing punctuation removal
- Duplicate removal

### 9.4 Workflow

```
1. Paste Email Content
        │
        ▼
2. Extract URLs (Automatic)
        │
        ▼
3. Batch Analysis
        │
        ▼
4. Results Summary
   ├─ Safe URLs (green)
   ├─ Suspicious URLs (yellow)
   └─ Phishing URLs (red)
```

### 9.5 Sample Detection

The email scanner includes sample emails for testing:

**Phishing Sample:**
```
Subject: URGENT: Your Account Has Been Suspended

We detected unusual activity on your account.
Click here to verify: http://paypal-secure-login.tk/verify
```

**Legitimate Sample:**
```
Subject: Your Amazon Order Confirmation

View your order: https://www.amazon.com/gp/your-account/order-details
```

---

## 10. Dashboard & Analytics

### 10.1 Overview

Real-time analytics dashboard showing scan history, threat statistics, and system performance.

### 10.2 Statistics Cards

| Metric | Description |
|--------|-------------|
| **Total Scans** | All-time scan count |
| **Threats Detected** | Phishing URLs identified |
| **Safe URLs** | Legitimate URLs scanned |
| **Detection Rate** | Phishing detection percentage |

### 10.3 Visualizations

**Risk Level Distribution (Pie Chart)**
- Critical (red)
- High (orange)
- Medium (yellow)
- Low (blue)
- Minimal (green)

**Scan Activity Timeline (Line Chart)**
- Total scans over time
- Threats detected trend
- Configurable time range (24h, 7d, 30d, All)

**Threat Categories (Bar Chart)**
- Financial
- Social Media
- E-commerce
- Government
- Other

### 10.4 Recent Scans

Live feed of recent URL analyses with:
- URL (truncated)
- Prediction status
- Confidence score
- Timestamp

### 10.5 System Performance

- **Avg. Scan Speed**: ~0.3s
- **Detection Accuracy**: 95.2%
- **System Reliability**: 99.8%
- **Model Version**: Random Forest v2.1

---

## 11. Machine Learning Model

### 11.1 Model Architecture

**Algorithm**: XGBoost Gradient Boosting Classifier

**Training Data**: PhiUSIIL Dataset + Custom Augmentation

**Features**: 30+ URL-based features

### 11.2 Feature Categories

**URL Structure Features:**
- URLLength
- DomainLength
- PathLength
- NumDots, NumHyphens, NumUnderscores
- NumSlashes, NumEquals, NumQuestionMarks

**Character Distribution:**
- LetterRatio
- DigitRatio
- SpecialCharRatio
- NumNumericChars

**Security Indicators:**
- IsHTTPS
- HasIPAddress
- HasAt
- HasDoubleSlash
- HasSuspiciousTLD
- HasSuspiciousPort
- IsShortURL

**Domain Analysis:**
- SubdomainLevel
- DomainEntropy
- NumSensitiveWords

### 11.3 Domain Intelligence

**High-Trust Whitelist:**
```python
HIGH_TRUST_DOMAINS = {
    'google.com', 'facebook.com', 'amazon.com',
    'microsoft.com', 'apple.com', 'github.com',
    'linkedin.com', 'twitter.com', 'youtube.com',
    # ... 100+ trusted domains
}
```

**Typosquatting Detection:**
- Levenshtein distance calculation
- Detects: g00gle.com, faceb00k.com, amaz0n.com

**Phishing Keywords:**
```python
PHISHING_KEYWORDS = [
    'login', 'verify', 'secure', 'account',
    'update', 'confirm', 'banking', 'password'
]
```

### 11.4 SHAP Explainability

Every prediction includes SHAP values showing:
- Which features contributed to the decision
- Direction of contribution (phishing vs legitimate)
- Magnitude of impact

**Example SHAP Output:**
```
Feature             Value    Contribution
─────────────────────────────────────────
HasIPAddress        1.0      +0.35 (phishing)
NumSensitiveWords   3.0      +0.25 (phishing)
IsHTTPS             0.0      +0.20 (phishing)
URLLength           85.0     +0.10 (phishing)
DomainEntropy       4.2      -0.05 (legitimate)
```

### 11.5 Model Files

```
backend/models/
├── production_xgboost_compatible.pkl    # Main model
├── feature_names_compatible.pkl         # Feature list
├── production_xgboost.json             # JSON export
└── model_info_enhanced.json            # Metadata
```

---

## 12. API Reference

### 12.1 Base URL

- **Production**: `https://api.shieldsight.tech`
- **Development**: `http://localhost:8000`

### 12.2 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/` | Single URL analysis |
| POST | `/predict/fast` | Fast mode (no SHAP) |
| POST | `/predict/batch` | Batch URL analysis |
| POST | `/predict/qr-scan` | QR code analysis |
| POST | `/predict/document-scan` | Document analysis |
| POST | `/predict/explain` | Detailed SHAP explanation |
| GET | `/predict/explanation/{hash}` | Get cached explanation |
| GET | `/predict/health` | Health check |
| GET | `/health` | System health |
| GET | `/metrics` | Performance metrics |

### 12.3 Authentication

Currently open API. Rate limiting applied:
- 100 requests/minute per IP
- Batch limited to 100 URLs

### 12.4 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid URL / Bad request |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Model not loaded |

---

## 13. Security Features

### 13.1 Input Validation

- URL format validation
- Path traversal prevention
- Filename sanitization
- Size limits enforcement

### 13.2 Secure Defaults

- HTTPS enforcement in production
- CORS configuration
- Rate limiting
- Request logging

### 13.3 Data Handling

- No URL storage (privacy-first)
- Temporary cache only (TTL: 300s)
- No PII collection

---

## 14. Performance Optimization

### 14.1 Caching Strategy

```python
# TTL Cache Configuration
prediction_cache = TTLCache(maxsize=10000, ttl=300)  # 5 min
explanation_cache = TTLCache(maxsize=5000, ttl=600)  # 10 min
```

### 14.2 Response Times

| Mode | Fresh Request | Cached |
|------|---------------|--------|
| Fast | ~140ms | ~4ms |
| Full | ~2000ms | ~4ms |

### 14.3 Optimization Techniques

1. **GZip Compression**: Reduces response size 60-80%
2. **Background SHAP**: Compute explanations asynchronously
3. **Skip External Checks**: Optional availability/geo bypass
4. **Pre-compiled Regex**: URL patterns compiled once
5. **Memoized Components**: React memo() for re-render prevention

---

## 15. Deployment Guide

### 15.1 Backend (Railway)

```bash
# Clone repository
git clone https://github.com/your-repo/shieldsight.git
cd shieldsight/backend

# Install dependencies
pip install -r requirements.txt

# Run locally
python -m app.main

# Or with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 15.2 Frontend (Vercel)

```bash
cd frontend

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

### 15.3 Environment Variables

**Backend (.env):**
```env
PORT=8000
LOG_LEVEL=INFO
CORS_ORIGINS=https://shieldsight.vercel.app
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.shieldsight.tech
VITE_FIREBASE_API_KEY=xxx
```

---

## 16. Chrome Extension

### 16.1 Features

- Real-time URL checking
- Page popup analysis
- Quick scan button
- Risk indicator badge

### 16.2 Files Structure

```
chrome-extension/
├── manifest.json      # Extension config
├── background.js      # Service worker
├── content.js         # Page injection
├── popup.html         # Popup UI
├── popup.js          # Popup logic
├── styles.css        # Styling
└── icons/            # Extension icons
```

### 16.3 Installation

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension` folder

---

## 📞 Support & Contact

- **Documentation**: https://docs.shieldsight.tech
- **API Status**: https://status.shieldsight.tech
- **GitHub**: https://github.com/your-repo/shieldsight
- **Email**: support@shieldsight.tech

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PhiUSIIL Dataset** - Training data
- **XGBoost** - ML framework
- **SHAP** - Explainability library
- **FastAPI** - Backend framework
- **React** - Frontend framework
- **Tailwind CSS** - Styling
- **Recharts** - Visualizations

---

**Made with ❤️ by the ShieldSight Team**

*Last Updated: January 22, 2026*
