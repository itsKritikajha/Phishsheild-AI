# 🛡️ Phishield AI - Enterprise Cyber Threat Protection

Phishield AI is an advanced, production-ready AI cybersecurity ecosystem designed to detect and mitigate phishing URLs, deceptive emails, and malicious website clones in real-time. Built with a futuristic, glassmorphism UI, it bridges the gap between complex machine learning data and accessible security awareness.

## 🌟 Key Features
- **Heuristic AI Engine**: Analyzes URLs using Random Forest & Logistic Regression to calculate Threat Levels, Confidence, and Reputation scores.
- **NLP Email Scanner**: Parses raw email strings for social engineering keywords and triggers confidence-based warnings.
- **Clone Detection**: Utilizes Sequence Matchers to calculate lexical and structural similarity (Typosquatting) between original domains and malicious clones.
- **Chrome Browser Extension**: A Manifest V3 extension that directly queries the AI engine to protect your browsing sessions in real time.
- **Enterprise Dashboard**: A stunning, animated interface featuring Global Threat Feeds, Scan Histories, and PDF Enterprise Report generation.

---

## 💻 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism & Neon Design), Javascript (Chart.js, jsPDF)
- **Backend API**: Python (Flask)
- **Machine Learning**: Scikit-learn, Pandas, Joblib (Random Forest Classifier)
- **Browser Extension**: Chrome Extension Manifest V3 (Javascript)

---

## ⚙️ Installation & Deployment Guide

### 1. Backend Setup (Flask API)
Ensure you have Python 3.8+ installed. 

```bash
# Clone the repository
git clone https://github.com/your-username/phishield-ai.git
cd "Phishield Ai"

# Install dependencies
pip install -r requirements.txt

# Train the AI Model (Generates phishield_model.pkl)
python train_model.py

# Start the Enterprise Dashboard
python app.py
```
> The dashboard will now be live at `http://127.0.0.1:5000`

### 2. Chrome Extension Setup
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked**.
5. Select the `extension/` folder located inside your Phishield AI directory.
6. Pin the Phishield extension. Navigate to any website and click the icon to perform a live scan via the Flask API!

---

## 📡 API Documentation

Phishield AI operates on a robust REST API hosted on `localhost:5000`.

### 1. URL Phishing Scan
`POST /scan`
- **Body**: `{ "url": "http://suspicious-link.com" }`
- **Response**: Returns threat level, confidence %, reputation score, and an array of AI reasoning metrics.

### 2. Email NLP Scan
`POST /scan-email`
- **Body**: `{ "content": "Urgent! Verify your banking password." }`
- **Response**: Returns confidence score and an array of triggered social engineering keywords.

### 3. Clone / Typosquatting Detection
`POST /compare-sites`
- **Body**: `{ "original": "paypal.com", "suspicious": "paypaI.com" }`
- **Response**: Returns lexical similarity percentages and threat warnings.

---

## 🚀 Hackathon & Pitch Guide
- **Live Demo Modes**: Use the quick-action buttons under the scanner in the UI to instantly populate Safe, Suspicious, or Malicious examples during your pitch.
- **Dynamic Threat Feed**: Point out the scrolling alert feed and the Global Threat Map to demonstrate the "Enterprise-scale" feeling of the dashboard.
- **PDF Export**: Generate a mock PDF report from the History tab to show B2B utility.

*Designed for Innovation. Built for Security.*
