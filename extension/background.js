// CyberGuard AI Extension Service Worker
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url, deep_analysis: false, force_refresh: false })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verdict === 'PHISHING') {
          chrome.action.setBadgeText({ text: 'ALERT', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#EF4444', tabId });
        } else if (data.verdict === 'SUSPICIOUS') {
          chrome.action.setBadgeText({ text: 'WARN', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#F97316', tabId });
        } else {
          chrome.action.setBadgeText({ text: 'SAFE', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId });
        }
      }
    } catch (e) {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});
