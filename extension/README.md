# 🛡️ CyberGuard AI - Browser Defense Extension (Manifest V3, v2.1.0)
> **Real-Time Autonomous Phishing Shield, Website Posture Auditor & Brand Deception Defense**

CyberGuard AI for Chromium browsers (Google Chrome, Brave, Microsoft Edge, Opera) delivers continuous, autonomous browsing security. It audits websites in the background the moment you visit them, alerting you to credential phishing traps, typo-squatted lookalike domains, and missing server perimeter defenses.

---

## 🚀 Key Features

### 1. 🔄 Automatic Background Threat Shield
- Powered by a modern **Manifest V3 Service Worker** (`background.js`).
- Automatically intercepts page navigation events (`chrome.tabs.onUpdated`).
- Audits live DNS infrastructure, Shannon lexical entropy, and brand contradiction vectors in the background—**without requiring manual clicks**.

### 2. ⚡ Instant Zero-Wait Popup Rendering (0ms Latency)
- Scan results are pre-audited and stored in `chrome.storage.local` (15-minute TTL per domain).
- Clicking the extension icon immediately displays the full security dossier:
  - **Threat Index (0–100)** with color-coded severity progress bar
  - **Security Posture Grade** (`A+`, `A`, `B`, `C`, `F`)
  - **Live Infrastructure Telemetry** (DNS A-record IPs, TLS encryption status, SPF/DMARC mail authentication, Domain Age)
  - **Defensive Vector Badges** (Lexical Entropy, Zero Contradiction, Encryption, Routing)
  - **AI Forensic Intelligence Brief**
- No more `--` placeholders or waiting for network round-trips!

### 3. 🚨 Real-Time Toolbar Badges & Native Notifications
- **`SAFE`** (Green): Verified benign website with healthy infrastructure.
- **`WARN`** (Orange): Suspicious markers, unencrypted HTTP, or newly registered domain.
- **`ALERT`** (Red): Active credential phishing threat or trademark impersonation.
- **Native OS Alert**: Chrome fires an immediate desktop alert when a critical phishing site is visited, preventing credential entry.

### 4. 🌐 Dual-Engine Operation (Autonomous Edge vs. SOC Core)
- **Local SOC Core Mode**: Connects directly to your local FastAPI backend (`http://localhost:8000`) for full 24-dimensional Random Forest triage and Playwright sandbox verification.
- **Autonomous Edge DNS Shield**: If the local backend is offline, the extension automatically operates via **Google DNS-over-HTTPS (RFC 8484)**, computing entropy and checking brand impersonation directly in the browser with **zero server required**.

### 5. 🔄 On-Demand Force Re-Scan
- Click the **🔄 Re-scan** button in the popup header at any time to bypass cache and re-audit the active tab with live network telemetry.

---

## 📦 How to Install in Chrome, Brave, or Edge

1. Open your Chromium-based browser and go to:
   ```text
   chrome://extensions/
   ```
2. Toggle on **"Developer mode"** in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left toolbar.
4. Select the `extension/` folder inside this project directory:
   ```text
   /Users/siddhartha/Desktop/aad/projects/cyberAI/extension
   ```
5. Pin the **CyberGuard AI** shield icon to your browser toolbar!
6. Open any tab and navigate to a website (e.g. `google.com`, `paypal.com`, `campuskart.shop`). Watch the badge update automatically in real time!

---

## ⚙️ Configuration & Settings

Click the **⚙️ Settings** icon in the extension popup header to customize:
- **Backend API Endpoint**: Default `http://localhost:8000` (can point to any remote CyberGuard instance).
- **Frontend Web App URL**: Default `http://localhost:5173` (used by the *"Open SOC Deep Inspection"* button).

---

## 📁 File Structure

```text
extension/
├── manifest.json       # Manifest V3 configuration, permissions, and icons
├── background.js       # Autonomous background service worker (auto-scanner)
├── popup.html          # Sleek cyberpunk HUD popup interface
├── popup.js            # Instant rendering engine, storage listener, and edge fallback
├── popup.css           # Responsive cyberpunk styling, animated bars, and status dots
├── icons/              # 16x16, 48x48, and 128x128 shield icons
└── README.md           # Documentation
```
