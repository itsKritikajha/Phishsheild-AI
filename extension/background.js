const API_URL = 'http://127.0.0.1:5000/scan';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: tab.url })
        })
        .then(res => res.json())
        .then(data => {
            if(!data.error) {
                chrome.tabs.sendMessage(tabId, { action: 'showThreatOverlay', data: data }).catch(err => {});
            }
        })
        .catch(err => console.log('API Offline or CORS error'));
    }
});
