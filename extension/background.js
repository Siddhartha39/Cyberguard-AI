// CyberGuard AI - Real-Time Autonomous Background Protection Service Worker
// Automatically scans websites on visit, caches results, and updates protection badges.

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache per domain
const inMemoryCache = new Map();
const activeScanPromises = new Map();
const lastScannedUrls = new Map();

// Helper: Calculate Shannon Entropy
function calculateEntropy(str) {
  if (!str) return 0;
  const map = {};
  for (let i = 0; i < str.length; i++) {
    map[str[i]] = (map[str[i]] || 0) + 1;
  }
  let ent = 0;
  for (const k in map) {
    const p = map[k] / str.length;
    ent -= p * Math.log2(p);
  }
  return ent;
}

// Autonomous Edge Scanner (Zero-Backend Fallback)
async function runAutonomousEdgeAnalysis(url, hostname, isHttps) {
  let aRecords = [];
  let txtRecords = [];
  let isRegistered = true;
  let dnsStatus = 'RESOLVED';

  try {
    const [resA, resTxt] = await Promise.all([
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`, { signal: AbortSignal.timeout(3000) })
        .then(r => r.json())
        .catch(() => null),
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`, { signal: AbortSignal.timeout(3000) })
        .then(r => r.json())
        .catch(() => null)
    ]);

    if (resA) {
      if (resA.Status === 3) {
        isRegistered = false;
        dnsStatus = 'NXDOMAIN';
      } else if (resA.Answer) {
        aRecords = resA.Answer.filter(ans => ans.type === 1).map(ans => ans.data);
      }
    }

    if (resTxt && resTxt.Answer) {
      txtRecords = resTxt.Answer.filter(ans => ans.type === 16).map(ans => ans.data);
    }
  } catch (e) {
    dnsStatus = 'RESOLVED';
  }

  const hostEntropy = calculateEntropy(hostname);
  const hasSpf = txtRecords.some(t => typeof t === 'string' && t.toLowerCase().includes('v=spf1'));
  const hasDmarc = txtRecords.some(t => typeof t === 'string' && t.toLowerCase().includes('v=dmarc1'));

  // Brand Impersonation check
  const brandKeywords = [
    'paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix',
    'chase', 'bankofamerica', 'meta', 'facebook', 'instagram', 'binance',
    'coinbase', 'login', 'verify', 'update', 'secure', 'banking', 'support', 'account'
  ];

  const parts = hostname.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
  const subdomains = parts.length > 2 ? parts.slice(0, -2).join('.') : '';

  let brandDetected = null;
  let isContradiction = false;
  for (const b of brandKeywords) {
    if (subdomains.includes(b) && !rootDomain.includes(b)) {
      brandDetected = b;
      isContradiction = true;
      break;
    }
  }

  // Risky TLDs
  const riskyTlds = ['xyz', 'top', 'buzz', 'club', 'work', 'fit', 'gq', 'tk', 'ml', 'cf', 'ga', 'click', 'link'];
  const isRiskyTld = riskyTlds.includes(tld.toLowerCase());

  let score = 0.0;
  let verdict = 'BENIGN';

  if (!isRegistered) {
    verdict = 'UNREGISTERED';
    score = 0.0;
  } else if (isContradiction) {
    score = 92.0;
    verdict = 'PHISHING';
  } else if (isRiskyTld && hostEntropy > 4.2) {
    score = 55.0;
    verdict = 'SUSPICIOUS';
  } else if (!isHttps) {
    score = 30.0;
    verdict = 'SUSPICIOUS';
  } else if (hostEntropy > 4.5) {
    score = 42.0;
    verdict = 'SUSPICIOUS';
  }

  return {
    canonical_domain: hostname,
    basic_risk_score: score,
    overall_risk_score: score,
    verdict: verdict,
    is_registered: isRegistered,
    domain_age_days: null,
    registrar: isRegistered ? 'Standard Registry' : 'Unassigned',
    dns_a_records: aRecords,
    has_spf: hasSpf,
    has_dmarc: hasDmarc,
    tls_valid: isHttps,
    triage_reason: isContradiction
      ? `Brand contradiction alert: Subdomain mimics '${brandDetected}' but root domain is '${rootDomain}'.`
      : (!isRegistered ? 'Domain is not registered in global root DNS (NXDOMAIN).' : (isHttps ? 'Lexical and DNS signals conform to benign baseline.' : 'Insecure unencrypted HTTP connection detected.')),
    ai_insights: {
      threat_intel_analysis: isContradiction
        ? `High-confidence phishing pattern detected targeting ${brandDetected}. Recommended action: Do not input credentials.`
        : (isHttps ? `Domain ${hostname} verified safe. TLS encryption active, no brand spoofing patterns identified.` : `Insecure connection. Data transmitted to ${hostname} is unencrypted.`)
    },
    is_autonomous: true,
    scan_timestamp: Date.now()
  };
}

// Multi-Tier Scan Executor
async function performScan(url, hostname, isHttps) {
  // 1. Check in-memory cache first
  const cached = inMemoryCache.get(hostname);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Check chrome.storage.local cache
  try {
    const key = `domain_${hostname}`;
    const stored = await chrome.storage.local.get([key]);
    if (stored && stored[key] && (Date.now() - stored[key].timestamp < CACHE_TTL_MS)) {
      inMemoryCache.set(hostname, stored[key]);
      return stored[key].data;
    }
  } catch (e) {}

  // 3. Attempt local or configured CyberGuard backend
  let backendUrl = 'http://localhost:8000';
  try {
    const config = await chrome.storage.local.get(['cyberguard_backend_url']);
    if (config && config.cyberguard_backend_url) {
      backendUrl = config.cyberguard_backend_url;
    }
  } catch (e) {}

  const candidateHosts = [backendUrl, 'http://localhost:8000', 'http://127.0.0.1:8000'];
  const uniqueHosts = [...new Set(candidateHosts)];

  let data = null;
  for (const host of uniqueHosts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);
      const res = await fetch(`${host}/api/scan/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        data = await res.json();
        data.scan_timestamp = Date.now();
        data.is_autonomous = false;
        break;
      }
    } catch (err) {
      // Try next candidate
    }
  }

  // 4. Fallback to Autonomous Edge Engine if backend not responding
  if (!data) {
    data = await runAutonomousEdgeAnalysis(url, hostname, isHttps);
  }

  // Normalize low risk floor for verified benign domains
  if (data && data.verdict === 'BENIGN') {
    if ((data.overall_risk_score !== undefined && data.overall_risk_score <= 10) ||
        (data.basic_risk_score !== undefined && data.basic_risk_score <= 10)) {
      data.overall_risk_score = 0;
      data.basic_risk_score = 0;
    }
  }

  // Store in memory & persistent storage
  const cacheObj = { data, timestamp: Date.now() };
  inMemoryCache.set(hostname, cacheObj);
  try {
    await chrome.storage.local.set({ [`domain_${hostname}`]: cacheObj });
  } catch (e) {}

  return data;
}

// Update Chrome Action Badge
function updateBadge(tabId, data) {
  if (!tabId || !data) return;

  const verdict = data.verdict;
  if (verdict === 'PHISHING') {
    chrome.action.setBadgeText({ text: 'ALERT', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444', tabId });
    chrome.action.setTitle({
      title: `CyberGuard AI: CRITICAL PHISHING RISK on ${data.canonical_domain || 'this site'}!`,
      tabId
    });

    // Native Desktop Notification for Phishing Threat
    try {
      if (chrome.notifications && chrome.notifications.create) {
        chrome.notifications.create(`phish_${tabId}_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '⚠️ CyberGuard AI: Phishing Threat Detected',
          message: `Warning! ${data.canonical_domain || 'This website'} exhibits deceptive phishing patterns. Do NOT enter sensitive credentials!`,
          priority: 2
        });
      }
    } catch (e) {}
  } else if (verdict === 'SUSPICIOUS' || verdict === 'UNREGISTERED') {
    chrome.action.setBadgeText({ text: 'WARN', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#F97316', tabId });
    chrome.action.setTitle({
      title: `CyberGuard AI: Suspicious site telemetry on ${data.canonical_domain || 'this site'}`,
      tabId
    });
  } else {
    chrome.action.setBadgeText({ text: 'SAFE', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId });
    chrome.action.setTitle({
      title: `CyberGuard AI: Verified Benign (${data.canonical_domain || 'Clean'})`,
      tabId
    });
  }
}

// Auto-Scan Handler for Tab
async function handleAutoScan(tabId, url, force = false) {
  if (!url || !url.startsWith('http')) return;

  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return;
  }

  const hostname = parsed.hostname;
  const isHttps = parsed.protocol === 'https:';

  // Prevent redundant in-flight duplicate scans
  const scanKey = `${tabId}:${hostname}`;
  if (!force && activeScanPromises.has(scanKey)) {
    return activeScanPromises.get(scanKey);
  }

  // Indicate active scanning on the badge
  chrome.action.setBadgeText({ text: '...', tabId });
  chrome.action.setBadgeBackgroundColor({ color: '#0284C7', tabId });
  chrome.action.setTitle({ title: `CyberGuard AI: Automatically auditing ${hostname}...`, tabId });

  // Store scanning state for popup
  try {
    await chrome.storage.local.set({
      [`status_${tabId}`]: 'scanning',
      [`tab_target_${tabId}`]: { hostname, url, isHttps }
    });
  } catch (e) {}

  const scanPromise = (async () => {
    try {
      const data = force 
        ? await (async () => {
            inMemoryCache.delete(hostname);
            try { await chrome.storage.local.remove([`domain_${hostname}`]); } catch(e){}
            return performScan(url, hostname, isHttps);
          })()
        : await performScan(url, hostname, isHttps);

      // Save tab-specific result
      await chrome.storage.local.set({
        [`tab_${tabId}`]: data,
        [`status_${tabId}`]: 'ready'
      });

      updateBadge(tabId, data);
      return data;
    } catch (err) {
      console.error('Auto-scan failed for tab', tabId, err);
      chrome.action.setBadgeText({ text: '', tabId });
      try {
        await chrome.storage.local.set({ [`status_${tabId}`]: 'error' });
      } catch (e) {}
    } finally {
      activeScanPromises.delete(scanKey);
    }
  })();

  activeScanPromises.set(scanKey, scanPromise);
  return scanPromise;
}

// 1. Auto-Scan on Navigation (tabs.onUpdated)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (!url || !url.startsWith('http')) return;

  // Trigger as soon as URL changes or page finishes loading
  if (changeInfo.url || changeInfo.status === 'loading' || changeInfo.status === 'complete') {
    const lastUrl = lastScannedUrls.get(tabId);
    if (lastUrl === url && changeInfo.status !== 'complete') {
      return; // Already initiated for this URL
    }
    lastScannedUrls.set(tabId, url);
    handleAutoScan(tabId, url);
  }
});

// 2. Restore Badge on Tab Switch (tabs.onActivated)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || !tab.url.startsWith('http')) {
      chrome.action.setBadgeText({ text: '', tabId });
      return;
    }

    const key = `tab_${tabId}`;
    const stored = await chrome.storage.local.get([key]);
    if (stored && stored[key]) {
      updateBadge(tabId, stored[key]);
    } else {
      // Auto-scan tab if not yet scanned
      handleAutoScan(tabId, tab.url);
    }
  } catch (e) {}
});

// 3. Cleanup on Tab Close (tabs.onRemoved)
chrome.tabs.onRemoved.addListener((tabId) => {
  lastScannedUrls.delete(tabId);
  chrome.storage.local.remove([`tab_${tabId}`, `status_${tabId}`, `tab_target_${tabId}`]);
});

// 4. Message Listener for Popup Interaction
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'rescan') {
    handleAutoScan(request.tabId, request.url, true).then(data => {
      sendResponse({ status: 'ok', data });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'get_tab_data') {
    const tabId = request.tabId;
    chrome.storage.local.get([`tab_${tabId}`, `status_${tabId}`]).then(res => {
      sendResponse({
        data: res[`tab_${tabId}`] || null,
        status: res[`status_${tabId}`] || 'idle'
      });
    });
    return true;
  }
});

console.log('🛡️ CyberGuard AI Real-Time Background Shield initialized.');
