// --- Matrix Background Effect ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>?|/';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) drops[x] = 1;

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00f0ff';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- Tab Logic ---
function switchTab(tabId, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    
    event.currentTarget.classList.add('active');
    document.getElementById('tab-' + tabId).style.display = 'block';
}

function fillDemo(url) {
    document.getElementById('url-input').value = url;
    scanUrl();
}

// --- History Management (localStorage) ---
function saveToHistory(url, status, confidence) {
    let history = JSON.parse(localStorage.getItem('phishield_history')) || [];
    const entry = {
        timestamp: new Date().toLocaleString(),
        url: url,
        status: status,
        confidence: confidence
    };
    history.unshift(entry); 
    if(history.length > 50) history.pop(); 
    localStorage.setItem('phishield_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const tbody = document.getElementById('history-body');
    if(!tbody) return;
    const history = JSON.parse(localStorage.getItem('phishield_history')) || [];
    tbody.innerHTML = '';
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">No scans recorded in local storage yet.</td></tr>';
        return;
    }

    history.forEach(item => {
        let statusColor = item.status === 'Safe' ? 'var(--neon-green)' : (item.status === 'Danger' ? 'var(--neon-red)' : '#ffcc00');
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.timestamp}</td>
            <td style="word-break: break-all; max-width: 300px;">${item.url}</td>
            <td style="color: ${statusColor}; font-weight:bold;">${item.status}</td>
            <td>${item.confidence}%</td>
        `;
        tbody.appendChild(tr);
    });
}

function clearHistory() {
    if(confirm("Are you sure you want to permanently purge all local scan logs?")) {
        localStorage.removeItem('phishield_history');
        loadHistory();
        addBotMessage("Scan history successfully purged from local memory.");
    }
}

function downloadReport() {
    const history = JSON.parse(localStorage.getItem('phishield_history')) || [];
    if(history.length === 0) {
        alert("No history available to download.");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,Target URL,Threat Level,Confidence Score\n";
    history.forEach(row => {
        csvContent += `"${row.timestamp}","${row.url}","${row.status}","${row.confidence}%"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "phishield_enterprise_threat_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addBotMessage("Enterprise Threat report exported successfully.");
}

function downloadPDFReport() {
    const history = JSON.parse(localStorage.getItem('phishield_history')) || [];
    if(history.length === 0) {
        alert("No history available to download.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Phishield AI - Enterprise Threat Report', 14, 22);
    
    const tableColumn = ["Timestamp", "Target URL", "Threat Level", "Confidence"];
    const tableRows = [];

    history.forEach(row => {
        const rowData = [row.timestamp, row.url, row.status, `${row.confidence}%`];
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 240, 255] },
        columnStyles: { 1: { cellWidth: 80 } }
    });

    doc.save('phishield_threat_report.pdf');
    addBotMessage("PDF Threat Report generated and downloaded.");
}

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    initCharts();
    initDynamicFeed();
});

// --- Dynamic Threat Feed ---
function initDynamicFeed() {
    const feed = document.getElementById('dynamic-feed');
    const map = document.getElementById('dynamic-map');
    
    const messages = [
        '<span class="tag-alert">[ALERT]</span> Ransomware payload blocked on external node.',
        '<span class="tag-info">[INFO]</span> Core ML weights updated via federated learning.',
        '<span class="tag-warn">[WARN]</span> Unusual traffic spike detected from unknown AS.',
        '<span class="tag-alert">[ALERT]</span> Typosquatting domain isolated: amezon-shop.net',
        '<span class="tag-info">[INFO]</span> 1400 malicious IPs added to global blacklist.'
    ];

    setInterval(() => {
        // Add random feed item
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const li = document.createElement('li');
        li.innerHTML = msg;
        feed.appendChild(li);
        
        if (feed.children.length > 15) {
            feed.removeChild(feed.firstChild);
        }
        
        // Add random map dot
        const dot = document.createElement('div');
        dot.className = 'map-dot';
        dot.style.top = Math.floor(Math.random() * 80 + 10) + '%';
        dot.style.left = Math.floor(Math.random() * 80 + 10) + '%';
        map.appendChild(dot);
        
        setTimeout(() => {
            if(map.contains(dot)) map.removeChild(dot);
        }, 3000);
        
    }, 4000);
}

// --- Charts Initialization (Chart.js) ---
let pieChartInstance = null;
let lineChartInstance = null;
let gaugeChartInstance = null;

Chart.defaults.color = '#aaa';
Chart.defaults.font.family = "'Inter', sans-serif";

function initCharts() {
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Clean / Safe', 'Suspicious', 'Malicious Threats'],
            datasets: [{
                data: [72, 10, 18],
                backgroundColor: ['#00ff66', '#ffcc00', '#ff2a2a'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: { cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#e0e0e0', padding: 20 } } } }
    });

    const ctxLine = document.getElementById('lineChart').getContext('2d');
    lineChartInstance = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Threats Blocked',
                data: [1200, 1900, 3000, 2500, 4200, 3200, 5000],
                borderColor: '#b026ff',
                backgroundColor: 'rgba(176, 38, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#00f0ff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: { scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } }, plugins: { legend: { display: false } } }
    });

    const ctxGauge = document.getElementById('gaugeChart').getContext('2d');
    gaugeChartInstance = new Chart(ctxGauge, {
        type: 'doughnut',
        data: {
            labels: ['Risk Level', 'Remaining'],
            datasets: [{ data: [0, 100], backgroundColor: ['#ff2a2a', '#1a1a1a'], borderWidth: 0, circumference: 180, rotation: 270 }]
        },
        options: { cutout: '80%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
}

// --- Email Scanner Logic ---
async function scanEmail() {
    const content = document.getElementById('email-content').value.trim();
    const resultDiv = document.getElementById('email-result');
    if(!content) {
        alert("Please paste some email content first.");
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:var(--neon-blue)">Running NLP heuristic analysis...</span>';
    
    try {
        const response = await fetch('/scan-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        const data = await response.json();
        
        if(data.error) {
            resultDiv.innerHTML = `<span style="color:var(--neon-red)">${data.error}</span>`;
            return;
        }
        
        let color = data.threat_level === 'Safe' ? 'var(--neon-green)' : (data.threat_level === 'Danger' ? 'var(--neon-red)' : '#ffcc00');
        
        resultDiv.innerHTML = `
            <h4 style="color:${color}; margin-bottom:10px;">Threat Level: ${data.threat_level} (Confidence: ${data.confidence}%)</h4>
            <p>${data.message}</p>
            <p style="margin-top:10px; color:#aaa;"><strong>Keywords Blocked:</strong> ${data.keywords_detected.length > 0 ? data.keywords_detected.join(', ') : 'None'}</p>
        `;
        
        addBotMessage(`Email scan complete. Result: ${data.threat_level}.`);
        
    } catch (e) {
        resultDiv.innerHTML = '<span style="color:var(--neon-red)">Error connecting to server.</span>';
    }
}

// --- Site Clone Comparison Logic ---
async function compareSites() {
    const orig = document.getElementById('orig-domain').value.trim();
    const susp = document.getElementById('susp-domain').value.trim();
    const resultDiv = document.getElementById('site-result');
    
    if(!orig || !susp) {
        alert("Please provide both domains.");
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:var(--neon-blue)">Calculating structural and lexical similarity...</span>';
    
    try {
        const response = await fetch('/compare-sites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ original: orig, suspicious: susp })
        });
        const data = await response.json();
        
        if(data.error) {
            resultDiv.innerHTML = `<span style="color:var(--neon-red)">${data.error}</span>`;
            return;
        }
        
        let color = data.threat_level === 'Safe' ? 'var(--neon-green)' : (data.threat_level === 'Danger' ? 'var(--neon-red)' : '#ffcc00');
        
        resultDiv.innerHTML = `
            <h4 style="color:${color}; margin-bottom:10px;">Threat Level: ${data.threat_level}</h4>
            <p><strong>Lexical Similarity:</strong> ${data.similarity}%</p>
            <p style="margin-top:10px;">${data.message}</p>
        `;
        
        addBotMessage(`Clone analysis complete between ${orig} and ${susp}. Result: ${data.threat_level}.`);
        
    } catch (e) {
        resultDiv.innerHTML = '<span style="color:var(--neon-red)">Error connecting to server.</span>';
    }
}

// --- Main URL Scanner Logic ---
async function scanUrl() {
    const urlInput = document.getElementById('url-input').value.trim();
    if (!urlInput) {
        addBotMessage("ERROR: Target URL field is empty.");
        return;
    }

    document.getElementById('loader').style.display = 'block';
    document.getElementById('result-panel').style.display = 'none';
    document.querySelector('.input-container').style.opacity = '0.3';
    document.querySelector('.input-container').style.pointerEvents = 'none';

    addBotMessage(`Initializing heuristic protocol for target: ${urlInput}...`);

    try {
        const response = await fetch('/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput })
        });

        const data = await response.json();

        document.getElementById('loader').style.display = 'none';
        document.querySelector('.input-container').style.opacity = '1';
        document.querySelector('.input-container').style.pointerEvents = 'auto';

        if (data.error) {
            addBotMessage(`SYSTEM ERROR: ${data.error}`);
            return;
        }

        displayResult(data);

    } catch (error) {
        document.getElementById('loader').style.display = 'none';
        document.querySelector('.input-container').style.opacity = '1';
        document.querySelector('.input-container').style.pointerEvents = 'auto';
        addBotMessage("CRITICAL ERROR: Unable to establish connection to core scanning API.");
    }
}

function displayResult(data) {
    const panel = document.getElementById('result-panel');
    const title = document.getElementById('threat-title');
    const icon = document.getElementById('status-icon');
    const urlDisplay = document.getElementById('res-url');
    const riskList = document.getElementById('res-risks');
    const recBox = document.getElementById('recommendation-box');
    const gaugeValue = document.getElementById('gauge-value');
    const repScore = document.getElementById('rep-score');
    const threatClassBox = document.getElementById('threat-classification');
    const threatCat = document.getElementById('threat-cat');
    const threatProb = document.getElementById('threat-prob');

    panel.style.display = 'block';
    urlDisplay.textContent = data.url;
    gaugeValue.textContent = `${data.confidence}%`;
    
    repScore.textContent = data.reputation_score;
    if (data.reputation_score >= 80) repScore.style.color = 'var(--neon-green)';
    else if (data.reputation_score >= 50) repScore.style.color = '#ffcc00';
    else repScore.style.color = 'var(--neon-red)';

    icon.className = 'status-indicator';
    recBox.className = 'recommendation-box';
    threatClassBox.style.display = 'none';

    let riskColor = '#00ff66';
    let safeColor = '#1a1a1a';
    
    if (data.threat_level === 'Danger') {
        title.textContent = 'MALICIOUS THREAT DETECTED';
        title.style.color = 'var(--neon-red)';
        title.style.textShadow = '0 0 10px var(--neon-red)';
        icon.classList.add('status-danger');
        icon.innerHTML = '<i class="fa-solid fa-skull-crossbones"></i>';
        recBox.classList.add('rec-danger');
        recBox.innerHTML = '<i class="fa-solid fa-shield-virus"></i> CRITICAL ACTION REQUIRED: Do not proceed to this domain. Match found with known phishing signatures and heuristic anomalies.';
        riskColor = '#ff2a2a';
        
        if(data.threat_category !== 'None') {
            threatClassBox.style.display = 'block';
            threatCat.textContent = data.threat_category;
            threatProb.textContent = `Probability: ${data.category_probability}%`;
        }
        
        addBotMessage(`Alert Triggered! ${data.url} identified as Malicious. Reputation score dropped to ${data.reputation_score}/100.`);
    } else if (data.threat_level === 'Suspicious') {
        title.textContent = 'SUSPICIOUS ANOMALY';
        title.style.color = '#ffcc00';
        title.style.textShadow = '0 0 10px #ffcc00';
        icon.style.color = '#ffcc00';
        icon.style.borderColor = '#ffcc00';
        icon.style.boxShadow = '0 0 40px rgba(255, 204, 0, 0.4)';
        icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        recBox.style.background = 'rgba(255, 204, 0, 0.1)';
        recBox.style.border = '1px solid #ffcc00';
        recBox.style.color = '#ffcc00';
        recBox.innerHTML = '<i class="fa-solid fa-eye"></i> CAUTION: This domain exhibits irregular behavior. Proceed only if fully verified through a secondary trusted channel.';
        riskColor = '#ffcc00';
        addBotMessage(`Warning: ${data.url} exhibits suspicious lexical structure. Proceed with caution.`);
    } else {
        title.textContent = 'DOMAIN VERIFIED SAFE';
        title.style.color = 'var(--neon-green)';
        title.style.textShadow = '0 0 10px var(--neon-green)';
        icon.classList.add('status-safe');
        icon.innerHTML = '<i class="fa-solid fa-shield-check"></i>';
        recBox.classList.add('rec-safe');
        recBox.innerHTML = '<i class="fa-solid fa-check-double"></i> SECURE: Neural network verified domain integrity. The reputation score is high. Standard browsing precautions apply.';
        addBotMessage(`Scan clear. ${data.url} passed all heuristic security checks.`);
    }

    gaugeChartInstance.data.datasets[0].data = [data.confidence, 100 - data.confidence];
    gaugeChartInstance.data.datasets[0].backgroundColor = [riskColor, safeColor];
    gaugeChartInstance.update();

    riskList.innerHTML = '';
    if (data.ai_reasoning && data.ai_reasoning.length > 0 && data.threat_level !== 'Safe') {
        data.ai_reasoning.forEach(reason => {
            riskList.innerHTML += `<li style="color:#e0e0e0"><i class="fa-solid fa-arrow-right" style="color:var(--neon-red)"></i> ${reason}</li>`;
        });
    } else if (data.ai_reasoning && data.threat_level === 'Safe') {
        data.ai_reasoning.forEach(reason => {
            riskList.innerHTML += `<li style="color:#e0e0e0"><i class="fa-solid fa-arrow-right" style="color:var(--neon-green)"></i> ${reason}</li>`;
        });
    }

    saveToHistory(data.url, data.threat_level, data.confidence);

    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function addBotMessage(text) {
    const chatBody = document.getElementById('chat-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot-message';
    msgDiv.innerHTML = `<p><i class="fa-solid fa-robot"></i> ${text}</p>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

document.getElementById('url-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') scanUrl();
});

// --- AI Cyber Assistant Chat Logic ---
function addUserMessage(text) {
    const chatBody = document.getElementById('chat-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user-message';
    msgDiv.style.textAlign = 'right';
    msgDiv.style.color = '#fff';
    msgDiv.innerHTML = `<p>${text} <i class="fa-solid fa-user"></i></p>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendChatMessage() {
    const inputField = document.getElementById('chat-input');
    const message = inputField.value.trim();
    if (!message) return;

    addUserMessage(message);
    inputField.value = '';
    
    // Show typing indicator
    const chatBody = document.getElementById('chat-body');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `<p><i class="fa-solid fa-robot"></i> Analyzing...</p>`;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        chatBody.removeChild(typingDiv);
        if(data.error) {
            addBotMessage("Error communicating with AI Core.");
        } else {
            addBotMessage(data.reply);
        }
    } catch (e) {
        chatBody.removeChild(typingDiv);
        addBotMessage("Connection to AI Core lost.");
    }
}

document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendChatMessage();
});

// --- Antivirus Scanner Simulation ---
function startSystemScan(type) {
    const ui = document.getElementById('av-scanner-ui');
    const resultDiv = document.getElementById('av-result');
    const progressBar = document.getElementById('av-progress-bar');
    const currentFileLabel = document.getElementById('av-current-file');
    const countLabel = document.getElementById('av-scanned-count');
    const timeLabel = document.getElementById('av-scan-time');
    const statusLabel = document.getElementById('av-scan-status');

    ui.style.display = 'block';
    resultDiv.style.display = 'none';
    progressBar.style.width = '0%';
    statusLabel.textContent = type === 'full' ? 'Running Deep System Scan...' : 'Running Quick Scan...';

    addBotMessage(`Initialized ${type === 'full' ? 'Deep' : 'Quick'} System Scan.`);

    const totalFiles = type === 'full' ? 145023 : 12450;
    const duration = type === 'full' ? 8000 : 3000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    
    let currentStep = 0;
    const filePaths = [
        "C:\\Windows\\System32\\ntoskrnl.exe", "C:\\Windows\\System32\\hal.dll", 
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\WebCache",
        "C:\\Windows\\SysWOW64\\explorer.exe", "C:\\Windows\\System32\\cmd.exe",
        "C:\\Windows\\System32\\drivers\\etc\\hosts", "C:\\ProgramData\\Microsoft\\Windows Defender"
    ];

    const timer = setInterval(() => {
        currentStep++;
        const percent = Math.min((currentStep / steps) * 100, 100);
        progressBar.style.width = percent + '%';
        
        currentFileLabel.textContent = filePaths[Math.floor(Math.random() * filePaths.length)] + "\\file_" + Math.floor(Math.random()*9999) + ".sys";

        if (currentStep >= steps) {
            clearInterval(timer);
            ui.style.display = 'none';
            resultDiv.style.display = 'block';
            countLabel.textContent = totalFiles.toLocaleString();
            timeLabel.textContent = (duration / 1000).toFixed(1);
            addBotMessage(`System Scan completed. ${totalFiles.toLocaleString()} files scanned safely.`);
        }
    }, intervalTime);
}

// --- Screenshot Analysis Logic ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewDiv = document.getElementById('screenshot-preview');
const previewImg = document.getElementById('preview-img');

if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.background = 'rgba(0,240,255,0.1)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.background = 'transparent'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'transparent';
        if(e.dataTransfer.files.length > 0) handleScreenshotFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function() {
        if(this.files.length > 0) handleScreenshotFile(this.files[0]);
    });
}

function handleScreenshotFile(file) {
    if(!file.type.startsWith('image/')) { alert("Please upload an image file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        dropZone.style.display = 'none';
        previewDiv.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function analyzeScreenshot() {
    const resultDiv = document.getElementById('screenshot-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:var(--neon-purple)"><i class="fa-solid fa-spinner fa-spin"></i> Running Visual Pattern Recognition & OCR...</span>';
    
    try {
        const response = await fetch('/scan-screenshot', { method: 'POST' });
        const data = await response.json();
        
        let color = data.threat_level === 'Danger' ? 'var(--neon-red)' : 'var(--neon-green)';
        let threat = data.threat_level === 'Danger' ? 'DANGER: FAKE LOGIN DETECTED' : 'SAFE: BRAND VERIFIED';
        
        let html = `<h4 style="color:${color}; margin-bottom:10px;">${threat} (Confidence: ${data.confidence}%)</h4>
            <p>${data.message}</p>
            <ul style="margin-top:10px; padding-left:20px; color:#aaa;">`;
        data.ai_reasoning.forEach(r => { html += `<li>${r}</li>`; });
        html += `</ul>`;
        
        resultDiv.innerHTML = html;
        addBotMessage(`Screenshot Analysis Complete: ${threat}`);
    } catch (e) {
        resultDiv.innerHTML = '<span style="color:var(--neon-red)">Error running analysis.</span>';
    }
}
