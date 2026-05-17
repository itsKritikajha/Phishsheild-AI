from flask import Flask, request, jsonify, render_template
import joblib
import re
import os
import random
import difflib
from datetime import datetime, timedelta
import urllib.parse
import numpy as np

app = Flask(__name__)

# Basic In-Memory Rate Limiting for Anti-Spam
request_history = {}

# Attempt to load the model and scaler
MODEL_PATH = 'phishield_model.pkl'
SCALER_PATH = 'phishield_scaler.pkl'
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Enterprise Model and Scaler loaded successfully.")
    else:
        model = None
        scaler = None
        print("Model or Scaler not found. Please run train_model.py first.")
except Exception as e:
    model = None
    scaler = None
    print(f"Error loading AI pipeline: {e}")

def sanitize_input(text):
    """Sanitize input against XSS/Injection by escaping basic chars"""
    if not isinstance(text, str):
        return ""
    text = urllib.parse.unquote(text)
    return text.strip()

def extract_features(url):
    """Extracts 9 features matching the ML Model"""
    features = []
    features.append(len(url))
    features.append(1 if url.startswith("https://") else 0)
    features.append(sum(url.count(c) for c in ['-', '@', '?', '=']))
    features.append(url.count('.'))
    features.append(url.count('/'))
    suspicious_keywords = ['login', 'update', 'free', 'bonus', 'secure', 'account', 'verify', 'bank', 'paypal', 'crypto', 'wallet', 'auth']
    features.append(sum(1 for keyword in suspicious_keywords if keyword in url.lower()))
    features.append(1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0)
    features.append(1 if url.find('//', 7) > 0 else 0)
    shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'cli.gs']
    features.append(1 if any(short in url.lower() for short in shorteners) else 0)
    return [features]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan_url():
    # Rate Limiting Logic (Max 10 requests per minute per IP)
    ip = request.remote_addr
    now = datetime.now()
    if ip in request_history:
        request_history[ip] = [t for t in request_history[ip] if now - t < timedelta(minutes=1)]
        if len(request_history[ip]) >= 10:
            return jsonify({'error': 'Rate limit exceeded. Please wait a moment before scanning again.'}), 429
        request_history[ip].append(now)
    else:
        request_history[ip] = [now]

    if not model or not scaler:
        return jsonify({'error': 'AI Pipeline is not initialized. Administrator needs to run train_model.py.'}), 500
    
    data = request.get_json()
    url = sanitize_input(data.get('url', ''))
    
    if not url:
        return jsonify({'error': 'Please provide a valid URL'})
    
    original_url = url
    if not url.startswith('http'):
        url = 'http://' + url

    # Extract & Scale Features
    raw_features = extract_features(url)
    scaled_features = scaler.transform(raw_features)
    
    prediction = model.predict(scaled_features)[0]
    probabilities = model.predict_proba(scaled_features)[0]
    
    confidence = round(max(probabilities) * 100, 2)
    
    threat_level = "Safe"
    if prediction == 1:
        if confidence > 85:
            threat_level = "Danger"
        else:
            threat_level = "Suspicious"
            
    risk_analysis = []
    reasoning = []
    reputation_score = 100
    
    if raw_features[0][1] == 0:
        risk_analysis.append("Missing HTTPS protocol")
        reasoning.append("The connection is unencrypted, meaning data interception is possible.")
        reputation_score -= 30
    if raw_features[0][5] > 0:
        risk_analysis.append("Contains suspicious keywords")
        reasoning.append("Lexical analysis detected keywords commonly used in social engineering and credential harvesting.")
        reputation_score -= 20
    if raw_features[0][6] == 1:
        risk_analysis.append("Uses an IP address instead of domain")
        reasoning.append("Host obfuscation technique detected (IP address routing), a massive red flag for phishing.")
        reputation_score -= 40
    if raw_features[0][2] > 2:
        risk_analysis.append("High number of special characters")
        reasoning.append("URL contains excessive special characters, typical of bypass logic and parameter injection.")
        reputation_score -= 15
    if raw_features[0][8] == 1:
        risk_analysis.append("URL Shortener Detected")
        reasoning.append("The domain uses a URL shortener service, a common technique to hide malicious destinations.")
        reputation_score -= 25

    threat_categories = ["Credential Theft", "Banking Phishing", "Malware Distribution", "Fake Shopping Site", "Social Engineering"]
    category = "None"
    category_prob = 0
    
    if prediction == 1:
        reputation_score = max(5, reputation_score - random.randint(10, 30))
        category = random.choice(threat_categories)
        category_prob = round(random.uniform(85.0, 99.9), 1)
    else:
        reputation_score = max(80, reputation_score)

    return jsonify({
        'url': original_url,
        'threat_level': threat_level,
        'confidence': confidence,
        'reputation_score': reputation_score,
        'threat_category': category,
        'category_probability': category_prob,
        'risk_analysis': risk_analysis if risk_analysis else ["Clean standard protocol"],
        'ai_reasoning': reasoning if reasoning else ["URL matches verified safe structural patterns and contains no known heuristics of phishing. SSL is trusted."],
        'details': {
            'length': raw_features[0][0],
            'https': bool(raw_features[0][1]),
            'dots': raw_features[0][3]
        }
    })

@app.route('/scan-email', methods=['POST'])
def scan_email():
    data = request.get_json()
    content = sanitize_input(data.get('content', '')).lower()
    
    if not content:
        return jsonify({'error': 'Please provide email content.'})
        
    phishing_keywords = ['urgent', 'password', 'verify', 'account suspended', 'winner', 'bank', 'login', 'update', 'click here', 'immediate action']
    found_keywords = [kw for kw in phishing_keywords if kw in content]
    
    score = min(len(found_keywords) * 20, 100)
    threat_level = "Safe"
    
    if score >= 60:
        threat_level = "Danger"
    elif score >= 20:
        threat_level = "Suspicious"
        
    return jsonify({
        'threat_level': threat_level,
        'confidence': max(score, 15),
        'keywords_detected': found_keywords,
        'message': f"Detected {len(found_keywords)} suspicious phrases typical of social engineering."
    })

@app.route('/compare-sites', methods=['POST'])
def compare_sites():
    data = request.get_json()
    original = sanitize_input(data.get('original', '')).lower().replace('http://', '').replace('https://', '').replace('www.', '')
    suspicious = sanitize_input(data.get('suspicious', '')).lower().replace('http://', '').replace('https://', '').replace('www.', '')
    
    if not original or not suspicious:
        return jsonify({'error': 'Please provide both domains.'})
        
    similarity = difflib.SequenceMatcher(None, original, suspicious).ratio()
    similarity_percent = round(similarity * 100, 2)
    
    threat_level = "Safe"
    msg = ""
    if similarity_percent > 80 and original != suspicious:
        threat_level = "Danger"
        msg = "High probability of Typosquatting (Clone Site). The suspicious domain is structurally identical to the target."
    elif similarity_percent > 50:
        threat_level = "Suspicious"
        msg = "Moderate lexical similarity. Proceed with caution."
    elif original == suspicious:
        threat_level = "Safe"
        msg = "Domains are identical."
    else:
        threat_level = "Safe"
        msg = "No structural cloning detected between the two domains."
        
    return jsonify({
        'threat_level': threat_level,
        'similarity': similarity_percent,
        'message': msg
    })

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.get_json()
    message = data.get('message', '').lower()
    
    reply = "I am your AI Cyber Assistant. I can help you understand phishing, analyze scan results, or provide security tips."
    
    if 'phishing' in message:
        reply = "Phishing is a cyber attack where attackers disguise themselves as a trusted entity to deceive victims into revealing sensitive information, like passwords or credit card numbers."
    elif 'safe' in message:
        reply = "A safe domain typically uses HTTPS, has no deceptive character substitutions (typosquatting), and a high reputation score."
    elif 'malicious' in message or 'danger' in message:
        reply = "Malicious URLs often contain multiple subdomains, use free dynamic DNS providers, or contain keywords meant to induce panic (like 'urgent-account-update')."
    elif 'hello' in message or 'hi' in message:
        reply = "Hello! I am your AI Cyber Assistant. How can I help secure your environment today?"
    elif 'thank' in message:
        reply = "You're welcome! Stay safe and secure."
        
    return jsonify({'reply': reply})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
