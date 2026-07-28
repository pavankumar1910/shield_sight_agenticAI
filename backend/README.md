# ShieldSight Backend API

AI-Powered Phishing Detection REST API with Explainable Predictions

## Features

- ✅ Real-time URL phishing detection
- ✅ SHAP-based explanations
- ✅ Batch prediction support
- ✅ Comprehensive logging
- ✅ API statistics tracking
- ✅ Auto-generated documentation

## Quick Start

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Run Server
```bash
python -m app.main
```

Server starts at: http://localhost:8000

### API Documentation

Visit: http://localhost:8000/docs

## API Endpoints

### Predictions

- **POST /predict/** - Predict single URL
- **POST /predict/batch** - Predict multiple URLs
- **POST /predict/explain** - Get SHAP explanation

### Health & Monitoring

- **GET /health** - Health check
- **GET /model/info** - Model information
- **GET /info** - API information
- **GET /stats** - Usage statistics

## Example Usage

### Python
```python
import requests

response = requests.post(
    "http://localhost:8000/predict/",
    json={"url": "http://suspicious-site.com"}
)

result = response.json()
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']}")
```

### cURL
```bash
curl -X POST "http://localhost:8000/predict/" \
  -H "Content-Type: application/json" \
  -d '{"url": "http://suspicious-site.com"}'
```

## Project Structure

backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── ml_model.py          # Model loader
│   ├── routes/
│   │   ├── health.py        # Health endpoints
│   │   └── predict.py       # Prediction endpoints
│   └── utils/
│       ├── feature_extraction.py
│       ├── validators.py
│       ├── logger.py
│       └── stats.py
├── logs/                    # Log files
├── test_*.py               # Test scripts
└── requirements.txt

## Model Information

- **Model:** XGBoost Classifier
- **Features:** 50 PhiUSIIL features
- **Accuracy:** ~95%
- **SHAP Values:** Pre-computed (500 samples)

## Development

### Run Tests
```bash
python test_model_load.py
python test_api.py
python test_explanation.py
python test_batch.py
```

### View Logs
```bash
tail -f logs/api_YYYYMMDD.log
```

## License

MIT License - ShieldSight Project