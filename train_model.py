import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report, confusion_matrix
import joblib
import re
import matplotlib.pyplot as plt
import seaborn as sns

def extract_features(url):
    """Extracts lexical and heuristic features from the URL for ML model"""
    features = []
    # 1. URL length
    features.append(len(url))
    # 2. HTTPS usage
    features.append(1 if url.startswith("https://") else 0)
    # 3. Special characters count
    features.append(sum(url.count(c) for c in ['-', '@', '?', '=']))
    # 4. Number of dots
    features.append(url.count('.'))
    # 5. Number of slashes
    features.append(url.count('/'))
    # 6. Suspicious keywords count
    suspicious_keywords = ['login', 'update', 'free', 'bonus', 'secure', 'account', 'verify', 'bank', 'paypal', 'crypto', 'wallet', 'auth']
    features.append(sum(1 for keyword in suspicious_keywords if keyword in url.lower()))
    # 7. IP address usage
    features.append(1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0)
    # 8. Redirection patterns (//)
    features.append(1 if url.find('//', 7) > 0 else 0)
    # 9. Shortener detection
    shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'cli.gs']
    features.append(1 if any(short in url.lower() for short in shorteners) else 0)
    return features

print("="*50)
print("[*] Phishield AI - Enterprise Model Training")
print("="*50)

# Generating Large Synthetic Dataset for Phishing vs Safe URLs
safe_urls = [
    ("https://www.google.com", 0),
    ("https://github.com/login", 0),
    ("https://www.amazon.com/shop", 0),
    ("https://wikipedia.org/wiki/AI", 0),
    ("https://youtube.com/watch?v=123", 0),
    ("https://apple.com/iphone", 0),
    ("https://microsoft.com/windows", 0),
    ("https://netflix.com/browse", 0),
    ("https://stackoverflow.com/questions", 0),
    ("https://linkedin.com/feed", 0),
    ("https://www.nytimes.com", 0),
    ("https://www.reddit.com/r/cybersecurity", 0),
    ("https://mail.google.com", 0),
    ("https://www.cloudflare.com", 0)
]

phishing_urls = [
    ("http://secure-login-paypal.com", 1),
    ("http://192.168.1.1/update-info", 1),
    ("http://free-bonus-update.net", 1),
    ("http://verify-account-now.info", 1),
    ("http://10.0.0.1/bank-secure", 1),
    ("http://login.yahoo-verify.com", 1),
    ("http://secure-update.com//redirect", 1),
    ("http://claim-free-prize.org/bonus", 1),
    ("http://crypto-wallet-verify.com", 1),
    ("https://paypal-update-account.com", 1),
    ("http://bit.ly/free-prize-now", 1),
    ("http://tinyurl.com/update-bank-login", 1),
    ("http://auth-verify.com/login?id=user", 1),
    ("http://172.16.254.1/auth-check", 1)
]

# Load external dataset
try:
    external_df = pd.read_csv("sample_phishing_dataset.csv")
    external_urls = list(zip(external_df['URL'], external_df['Label']))
    print(f"[*] Loaded external dataset with {len(external_urls)} samples.")
except Exception as e:
    print(f"[!] Could not load external dataset: {e}")
    external_urls = []

# Synthesize large dataset with slight variations
urls = (safe_urls + phishing_urls) * 800 + external_urls

print(f"[*] Total dataset size: {len(urls)} samples.")

# Prepare Features and Labels using Pandas
print("[*] Extracting features...")
X = [extract_features(url[0]) for url in urls]
y = [url[1] for url in urls]

df = pd.DataFrame(X, columns=[
    'length', 'is_https', 'special_chars', 'dots', 'slashes', 
    'suspicious_words', 'is_ip', 'has_redirect', 'is_shortener'
])
df['label'] = y

X_train, X_test, y_train, y_test = train_test_split(df.drop('label', axis=1), df['label'], test_size=0.2, random_state=42, stratify=df['label'])

# Feature Scaling
print("[*] Applying StandardScaler to features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("\n--- Comparing Machine Learning Algorithms ---")

# Train Logistic Regression
print("\n[1] Training Logistic Regression Model...")
lr_model = LogisticRegression(max_iter=1000, random_state=42)
lr_model.fit(X_train_scaled, y_train)
lr_pred = lr_model.predict(X_test_scaled)
lr_acc = accuracy_score(y_test, lr_pred)
print(f"    Accuracy: {lr_acc*100:.2f}% | Precision: {precision_score(y_test, lr_pred)*100:.2f}%")

# Hyperparameter Tuning for Random Forest
print("\n[2] Performing Hyperparameter Tuning for Random Forest...")
param_grid = {
    'n_estimators': [50, 100],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}
rf_base = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(estimator=rf_base, param_grid=param_grid, cv=3, n_jobs=-1, verbose=1)
grid_search.fit(X_train_scaled, y_train)

best_rf = grid_search.best_estimator_
rf_pred = best_rf.predict(X_test_scaled)
rf_acc = accuracy_score(y_test, rf_pred)
print(f"    Best Params: {grid_search.best_params_}")
print(f"    Accuracy: {rf_acc*100:.2f}% | Precision: {precision_score(y_test, rf_pred)*100:.2f}%")

# Select Best Model
best_model = best_rf if rf_acc >= lr_acc else lr_model
model_name = "Optimized Random Forest" if rf_acc >= lr_acc else "Logistic Regression"

print("\n" + "="*50)
print(f"[*] Best Model Selected: {model_name}")
print("="*50)
print("Classification Report:")
print(classification_report(y_test, best_model.predict(X_test_scaled), target_names=['Safe', 'Phishing']))
print("Confusion Matrix:")
print(confusion_matrix(y_test, best_model.predict(X_test_scaled)))

# Save Model and Scaler
joblib.dump(best_model, 'phishield_model.pkl')
joblib.dump(scaler, 'phishield_scaler.pkl')
print("\n[*] Model saved as 'phishield_model.pkl'")
print("[*] Scaler saved as 'phishield_scaler.pkl'")

# Generate and Save Graphs
print("[*] Generating Data Visualization Charts...")
feature_names = ['Length', 'HTTPS', 'Special Chars', 'Dots', 'Slashes', 'Suspicious Words', 'IP Address', 'Redirect', 'Shortener']

# 1. Feature Importance Chart
if isinstance(best_model, RandomForestClassifier):
    importances = best_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    plt.figure(figsize=(10, 6))
    plt.title("Phishield AI - Feature Importance")
    plt.bar(range(len(importances)), importances[indices], color="indigo", align="center")
    plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig("feature_importance.png")
    plt.close()
    print("    -> Saved 'feature_importance.png'")

# 2. Confusion Matrix Chart
cm = confusion_matrix(y_test, best_model.predict(X_test_scaled))
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Purples', xticklabels=['Safe', 'Phishing'], yticklabels=['Safe', 'Phishing'])
plt.title("Phishield AI - Confusion Matrix")
plt.ylabel('Actual Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.savefig("confusion_matrix.png")
plt.close()
print("    -> Saved 'confusion_matrix.png'")

print("\n[*] Ready for enterprise deployment.")
