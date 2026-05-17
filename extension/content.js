chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showThreatOverlay') {
        const data = request.data;
        let overlay = document.getElementById('phishield-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'phishield-overlay';
            document.body.appendChild(overlay);
        }
        
        let color = '#00ff66';
        let icon = '✅';
        let text = 'Safe';
        
        if (data.threat_level === 'Danger') {
            color = '#ff2a2a';
            icon = '💀';
            text = 'DANGER: PHISHING DETECTED';
            // Auto block page visually
            document.body.innerHTML = `<div style="background:#050505; color:#fff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Segoe UI', sans-serif;">
                <h1 style="color:#ff2a2a; font-size:4rem; margin-bottom:10px;">🛑 ACCESS BLOCKED</h1>
                <h2 style="color:#fff; margin-bottom:20px;">Phishield AI Enterprise Protection</h2>
                <p style="font-size:1.2rem; max-width:600px; text-align:center; line-height:1.6;">We have prevented you from accessing a dangerous phishing domain to protect your credentials and identity.</p>
                <div style="background:rgba(255,42,42,0.1); border:1px solid #ff2a2a; padding:20px; border-radius:10px; margin-top:30px;">
                    <p style="margin:5px 0;"><strong>AI Confidence:</strong> ${data.confidence}%</p>
                    <p style="margin:5px 0;"><strong>Threat Level:</strong> Critical Danger</p>
                    <p style="margin:5px 0;"><strong>Reputation Score:</strong> ${data.reputation_score}/100</p>
                </div>
            </div>`;
            return;
        } else if (data.threat_level === 'Suspicious') {
            color = '#ffcc00';
            icon = '⚠️';
            text = 'Suspicious Domain';
        }
        
        overlay.innerHTML = `
            <div style="background: rgba(5,5,5,0.95); border: 1px solid ${color}; padding: 15px 25px; border-radius: 8px; box-shadow: 0 0 20px ${color}44; display: flex; align-items: center; gap: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; z-index: 2147483647; position: fixed; top: 20px; right: 20px; backdrop-filter: blur(10px); color: #fff; transition: 0.3s; animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size: 2.5rem; text-shadow: 0 0 10px ${color};">${icon}</div>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: ${color}; font-size: 1.2rem; font-weight:600;">Phishield AI: ${text}</h4>
                    <p style="margin: 0; font-size: 0.9rem; color: #ccc;">Confidence: ${data.confidence}% | Rep: ${data.reputation_score}/100</p>
                </div>
                <button onclick="document.getElementById('phishield-overlay').remove()" style="background:transparent; border:none; color:#888; cursor:pointer; font-size:1.5rem; margin-left:15px; padding:0 5px;">&times;</button>
            </div>
            <style>
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            </style>
        `;
        
        if (data.threat_level === 'Safe') {
            setTimeout(() => { if(document.getElementById('phishield-overlay')) document.getElementById('phishield-overlay').style.opacity = '0'; setTimeout(()=>{ if(document.getElementById('phishield-overlay')) document.getElementById('phishield-overlay').remove()}, 500); }, 4000);
        }
    }
});
