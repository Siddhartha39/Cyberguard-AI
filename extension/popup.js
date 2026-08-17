document.addEventListener('DOMContentLoaded', async () => {
  const domainEl = document.getElementById('domainName');
  const badgeEl = document.getElementById('badge');
  const riskScoreEl = document.getElementById('riskScore');
  const secGradeEl = document.getElementById('secGrade');
  const alertBoxEl = document.getElementById('alertBox');
  const alertTitleEl = document.getElementById('alertTitle');
  const alertDescEl = document.getElementById('alertDesc');
  const aiSummaryEl = document.getElementById('aiSummary');
  const deepScanBtn = document.getElementById('deepScanBtn');

  // Query active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    domainEl.innerText = 'No active tab';
    return;
  }

  const currentUrl = tab.url;
  try {
    const urlObj = new URL(currentUrl);
    domainEl.innerText = urlObj.hostname;

    // Check backend API
    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: currentUrl, deep_analysis: false, force_refresh: false })
    });

    if (response.ok) {
      const data = await response.json();
      const score = Math.round(data.overall_risk_score);
      riskScoreEl.innerText = `${score}/100`;

      const grade = data.security_audit ? data.security_audit.security_grade : 'B';
      secGradeEl.innerText = grade;

      if (data.verdict === 'PHISHING') {
        badgeEl.className = 'badge badge-danger';
        badgeEl.innerText = 'PHISHING THREAT';
        alertBoxEl.style.display = 'block';
        alertTitleEl.innerText = 'CRITICAL PHISHING RISK DETECTED';
        alertDescEl.innerText = data.brand_analysis && data.brand_analysis.is_contradiction
          ? data.brand_analysis.contradiction_explanation
          : 'This site exhibits deceptive phishing patterns targeting sensitive data.';
      } else if (data.verdict === 'SUSPICIOUS') {
        badgeEl.className = 'badge badge-warning';
        badgeEl.innerText = 'SUSPICIOUS';
      } else {
        badgeEl.className = 'badge badge-safe';
        badgeEl.innerText = 'VERIFIED BENIGN';
      }

      if (data.ai_insights && data.ai_insights.threat_intel_analysis) {
        aiSummaryEl.innerText = data.ai_insights.threat_intel_analysis;
      } else {
        aiSummaryEl.innerText = `Domain evaluated with ${data.evidence_breakdown ? data.evidence_breakdown.length : 0} verified forensic signals. Action: ${data.recommended_action}`;
      }
    } else {
      aiSummaryEl.innerText = 'CyberGuard Core offline. Start local FastAPI service at :8000.';
    }
  } catch (err) {
    aiSummaryEl.innerText = 'Local scanner engine unreachable. Ensure CyberGuard server is running.';
  }

  deepScanBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `http://localhost:5173/?scan=${encodeURIComponent(currentUrl)}` });
  });
});
