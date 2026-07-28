# 🛡️ ShieldSight AI - Multi-Agent Phishing Detection & Intelligent Security Assistant

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

ShieldSight AI is a **Multi-Agent AI-powered phishing detection platform** that combines Machine Learning, Retrieval-Augmented Generation (RAG), and Generative AI to provide intelligent phishing analysis and explainable security reports.

The system uses an **XGBoost Machine Learning model** for phishing detection, **SHAP Explainability** to explain predictions, and a **RAG-powered AI Copilot** that answers user questions strictly based on the generated phishing report.

---

# 🚀 Key Features

## 🤖 Multi-Agent AI Architecture

The entire system is designed as a **Multi-Agent AI workflow**, where each module behaves as an independent AI agent.

### 🕵️ Detection Agent
- Receives the submitted URL.
- Extracts phishing-related features.
- Uses the trained XGBoost model for prediction.

---

### 📊 Explainability Agent
- Uses SHAP (SHapley Additive Explanations).
- Explains why the URL is predicted as Safe or Phishing.
- Displays feature importance with transparent reasoning.

---

### 📄 Report Generation Agent
- Generates a detailed phishing analysis report.
- Summarizes:
  - Prediction
  - Risk Score
  - Feature Analysis
  - Threat Indicators
  - Final Recommendation

---

### 📚 RAG Knowledge Agent (New)

A Retrieval-Augmented Generation (RAG) pipeline has been added.

After the phishing report is generated:

- The report is converted into embeddings.
- The report is indexed for retrieval.
- The AI retrieves only relevant sections from the generated report.

This ensures factual and grounded responses.

---

### 💬 GenAI Security Copilot (New)

An intelligent AI Security Assistant is integrated into the platform.

Instead of answering from general LLM knowledge, the Copilot:

- Retrieves information only from the generated phishing report.
- Uses the RAG pipeline as context.
- Never hallucinates unrelated phishing information.
- Provides grounded answers specific to the analyzed URL.

Example:

User:
> Why was this URL classified as phishing?

The Copilot answers only using the generated report instead of external knowledge.

---

### 💾 Storage Agent

All generated reports, scan history, and user information are stored using **Supabase**.

Supabase is used for:

- Scan History
- Report Storage
- User Data
- Analytics
- Session Management

---

### 📈 Analytics Agent

Tracks:

- Previous scans
- User history
- Detection statistics
- Safe vs Phishing counts

---

# ✨ Features

- ✅ AI-powered phishing detection
- ✅ Multi-Agent AI workflow
- ✅ XGBoost Machine Learning
- ✅ SHAP Explainability
- ✅ RAG-based Retrieval Pipeline
- ✅ Grounded GenAI Security Copilot
- ✅ Supabase Cloud Database
- ✅ Batch URL Processing
- ✅ Scan History
- ✅ Interactive Dashboard
- ✅ Dark / Light Theme
- ✅ Mobile Responsive
- ✅ Firebase Authentication

---

# 🏗️ Updated System Architecture

```
                    User
                      │
                      ▼
             URL Submission Agent
                      │
                      ▼
            Detection Agent (XGBoost)
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
Explainability Agent         Report Agent
       (SHAP)                     │
                                  ▼
                       Report Generation
                                  │
                                  ▼
                        Supabase Storage
                                  │
                                  ▼
                          RAG Retrieval
                                  │
                                  ▼
                      GenAI Security Copilot
                                  │
                                  ▼
                       Context-Aware Responses
```

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

---

## Backend

- FastAPI
- Python 3.11

---

## Machine Learning

- XGBoost
- SHAP
- Scikit-learn
- NumPy
- Pandas

---

## Generative AI

- OpenAI GPT
- Retrieval-Augmented Generation (RAG)
- LangChain (Optional Integration)
- Embeddings
- Prompt Engineering

---

## Database

- Supabase
- Firebase Authentication

---

## Cloud Deployment

- Vercel
- Render
- HuggingFace Hub

---

# 📦 Installation



## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🧠 AI Workflow

```
User URL
    │
    ▼
Detection Agent
    │
    ▼
XGBoost Prediction
    │
    ▼
SHAP Explainability
    │
    ▼
Report Generation
    │
    ▼
Store Report in Supabase
    │
    ▼
Generate Embeddings
    │
    ▼
RAG Retrieval
    │
    ▼
GenAI Copilot
    │
    ▼
Grounded User Responses
```

---

# 📊 Model Performance

Evaluated using:

- PhiUSIIL Dataset
- Alexa Top-1M Dataset

Performance

| Metric | Score |
|---------|--------|
| Accuracy | 95.2% |
| Precision | 95.1% |
| Recall | 95.3% |
| False Positive Rate | <4% |

---

# 🔒 Security

- Firebase Authentication
- Secure API Communication
- Encrypted Cloud Storage
- Grounded AI Responses using RAG
- Explainable AI Predictions
- No hallucinated security recommendations

---

# 🚀 Future Enhancements

- Multi-LLM Routing
- Email Phishing Detection
- Browser Extension AI Copilot
- Threat Intelligence Integration
- Vector Database Support
- Autonomous AI Security Agents
- SOC Dashboard
- Real-Time Threat Monitoring

---

# 📄 License

Licensed under the MIT License.

---

# 👨‍💻 Author

**PAVAN KUMAR R S**

GitHub:
https://github.com/pavankumar1910

Email:
pavankumar19102004@gmail.com

---

## ⭐ Project Highlights

- Multi-Agent AI Architecture
- XGBoost-based Phishing Detection
- SHAP Explainable AI
- RAG-enabled Report Retrieval
- Grounded GenAI Security Copilot
- Supabase Cloud Storage
- Firebase Authentication
- React + FastAPI Full-Stack Application