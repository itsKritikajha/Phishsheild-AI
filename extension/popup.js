// --- CONFIGURATION ---
// Change this to your production URL when you deploy the Flask app (e.g., "https://phishield-api.onrender.com/scan")
const API_URL = 'http://127.0.0.1:5000/scan';
// ---------------------

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentUrl = tabs[0].url;
        document.getElementById('current-url').textContent = currentUrl;
    });

    document.getElementById('scan-btn').addEventListener('click', () => {
        const btn = document.getElementById('scan-btn');
        const status = document.getElementById('ai-status');
        const conf = document.getElementById('ai-confidence');
        
        btn.textContent = "Scanning...";
        status.textContent = "Analyzing patterns...";
        status.className = "";
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let url = tabs[0].url;
            
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            })
            .then(response => response.json())
            .then(data => {
                btn.textContent = "Scan Current Page";
                if(data.error) {
                    status.textContent = "API Error.";
                    return;
                }
                
                status.textContent = data.threat_level.toUpperCase();
                conf.textContent = `Confidence: ${data.confidence}% | Rep Score: ${data.reputation_score}`;
                
                if(data.threat_level === 'Safe') status.className = 'threat-safe';
                else if(data.threat_level === 'Danger') status.className = 'threat-danger';
                else status.className = 'threat-suspicious';
            })
            .catch(err => {
                btn.textContent = "Scan Current Page";
                status.textContent = "API Offline.";
                conf.textContent = `Ensure the Flask server is running at ${API_URL}`;
            });
        });
    });
});
