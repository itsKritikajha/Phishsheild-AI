# Phishield AI - Architecture Diagrams

This document contains professional architecture diagrams generated via Mermaid.js. You can screenshot these or embed them directly into your PPT.

## 1. System Architecture Diagram

```mermaid
graph TD
    %% User Interfaces
    User([User / Client])
    Extension[Chrome Browser Extension]
    Dashboard[Web Dashboard UI]
    
    %% API Layer
    API[Flask REST API Layer]
    
    %% Processing Modules
    Sanitizer[Input Sanitizer & Rate Limiter]
    FeatureExtractor[Feature Extraction Engine]
    NLP[NLP Keyword Analyzer]
    Similarity[Lexical Clone Detector]
    
    %% Machine Learning Core
    Scaler[Standard Scaler]
    ML[Random Forest Classifier]
    Explainability[AI Reason Generator]
    
    %% Data
    LocalStorage[(Local Storage / History)]
    
    %% Connections
    User --> Extension
    User --> Dashboard
    Extension -- "POST /scan" --> API
    Dashboard -- "POST /scan" --> API
    Dashboard -- "POST /scan-email" --> API
    Dashboard -- "POST /compare-sites" --> API
    
    API --> Sanitizer
    Sanitizer --> FeatureExtractor
    Sanitizer --> NLP
    Sanitizer --> Similarity
    
    FeatureExtractor --> Scaler
    Scaler --> ML
    ML --> Explainability
    
    Explainability -- "Threat Score & Reasoning" --> API
    API -- "JSON Response" --> Dashboard
    API -- "JSON Response" --> Extension
    
    Dashboard --> LocalStorage
```

---

## 2. Machine Learning Pipeline Flow

```mermaid
flowchart LR
    A[(Phishing Dataset)] --> B[Data Synthesis & Pandas Formatting]
    B --> C[Feature Engineering \n Length, SSL, Chars, etc.]
    C --> D[Standard Scaler \n Normalization]
    
    D --> E{Model Selection}
    E --> F[Random Forest \n GridSearchCV]
    E --> G[Logistic Regression]
    
    F --> H{Comparison Engine}
    G --> H
    
    H -- "Best Accuracy Picked" --> I[phishield_model.pkl]
```

---

## 3. Real-Time Detection Workflow

```mermaid
sequenceDiagram
    participant User
    participant Chrome as Browser Extension
    participant API as Flask Server
    participant AI as ML Engine
    
    User->>Chrome: Navigates to unknown website
    Chrome->>API: HTTP POST (Target URL)
    API->>API: Validate & Sanitize Input
    API->>API: Extract 9 Heuristic Features
    API->>AI: scaled_features = scaler.transform()
    AI->>AI: model.predict(scaled_features)
    AI-->>API: Threat Level (Safe/Suspicious/Danger)
    API->>API: Generate Explainability Logic
    API-->>Chrome: JSON Response
    Chrome-->>User: Red Warning Popup & Recommendation
```
