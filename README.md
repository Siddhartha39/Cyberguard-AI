# CyberGuard AI (v2.0-SOC PRO)
> **AI-Powered Phishing Intelligence, Attack-Chain Forensics & Website Security Auditor**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-2EAD33?logo=playwright)](https://playwright.dev)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9-F7931E?logo=scikitlearn)](https://scikit-learn.org)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75FF?logo=googlegemini)](https://ai.google.dev/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions/)

---

## 🌟 Executive Summary & Capabilities

Unlike conventional binary URL blacklists or simplistic classifiers, **CyberGuard AI** provides an end-to-end explainable intelligence and zero-trust vulnerability audit platform. It unites high-dimensional lexical ML features, real-time WHOIS RDAP registrar telemetry, isolated Playwright headless browser crawling, multi-modal brand vision perceptual hashing (pHash), HTTP defense headers auditing, Google Gemini AI exploit analysis, and full 7-stage attack-chain reconstruction into a unified cyber command terminal.

### Key Differentiators:
1. **Explainable Phishing Attack-Chain Reconstruction**: Reconstructs the complete forensic timeline: `Candidate Ingress` $\rightarrow$ `DNS / TLS Infrastructure` $\rightarrow$ `Redirect Sequence` $\rightarrow$ `Landing Page Simulation` $\rightarrow$ `Credential Harvesting Hook` $\rightarrow$ `External Exfiltration Destination` $\rightarrow$ `Calibrated Verdict`.
2. **Brand-Domain Contradiction Engine**: Explicitly validates whether the brand implied by page visuals, logos, and DOM content is authorized by the actual registered domain (e.g. page imitates PayPal or Bank of America on an unauthorized domain $\rightarrow$ flags high-severity contradiction finding).
3. **Website Security Posture & Exploitability Auditor**: Website owners can check their own domain defense posture:
   - **Clickjacking Immunity**: Validates `X-Frame-Options` and `frame-ancestors`.
   - **Email Spoofing Defense**: Inspects DNS `SPF` and `DMARC` policies to prevent impersonation.
   - **HSTS & Downgrade Defense**: Checks `Strict-Transport-Security` enforcement.
   - **Content-Security-Policy (CSP)**: Audits XSS and injection defenses.
   - Computes executive security grades (`A+` to `F`) with developer remediation steps.
4. **Google Gemini AI Exploit & Penetration Audit**: Employs Google Gemini AI to analyze forensic telemetry and explain how a malicious actor would exploit the target domain in plain English.
5. **Real-Time Manifest V3 Chrome Extension**: Background endpoint protection shield with 1-click ZIP download and setup guide.
6. **Discovery Mode (Newly Registered Domains - NRD Stream)**: Real-time stream ingestion with fast triage scoring and one-click escalation to deep browser analysis.
7. **Analyst Feedback Loop**: Human-in-the-loop validation (True Positive / False Positive tracking) for continuous model calibration.
8. **Dual Light & Dark Cyber Themes**: Real-time theme switcher with high-contrast forensic styling.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |     CyberGuard AI SOC Console         |
                                  |  - Live Scanner & Progress Stepper    |
                                  |  - Interactive Attack-Chain Graph     |
                                  |  - Website Exploitability Auditor     |
                                  |  - Brand Contradiction Card           |
                                  |  - Calibrated Evidence Matrix         |
                                  |  - Gemini AI Threat Explainer         |
                                  |  - NRD Discovery Stream & Escalation  |
                                  |  - Forensic Report Generator (PDF/MD) |
                                  +-------------------+-------------------+
                                                      |
                                                      v REST API
                                  +---------------------------------------+
                                  |          FastAPI Core Gateway         |
                                  +-------------------+-------------------+
                                                      |
         +--------------------+-----------------------+-----------------------+
         |                    |                       |                       |
         v                    v                       v                       v
+-----------------+  +-----------------+  +-----------------------+  +-----------------+
| Fast Triage ML  |  | Domain & Infra  |  | Safe Browser Sandbox  |  | Multi-Modal     |
| (Random Forest  |  | (DNS, RDAP,     |  | (Playwright Headless, |  | Brand Matcher   |
| 24-feat vector) |  | TLS context)    |  | SSRF Guard, Forms)    |  | & Contradiction |
+--------+--------+  +--------+--------+  +-----------+-----------+  +--------+--------+
         |                    |                       |                       |
         +--------------------+-----------------------+-----------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  | Multi-Signal Calibrated Risk Fusion   |
                                  | + Security Headers Exploitability     |
                                  | + Google Gemini Threat Intelligence   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  | Persistent SQLite Forensic Case DB    |
                                  | & Human-in-the-Loop Analyst Feedback  |
                                  +---------------------------------------+
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Backend Installation & Run
```bash
# Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt
playwright install chromium

# Start the FastAPI backend server
cd ..
PYTHONPATH=backend python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Backend API will be live at: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)

### 3. Frontend Installation & Run
```bash
# Navigate to frontend and install dependencies
cd frontend
npm install

# Start the Vite development server
npm run dev -- --host 0.0.0.0 --port 5173
```
Frontend SOC Console will be live at: `http://localhost:5173`

### 4. Chrome Extension Installation (Manifest V3)
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** at the top-right toggle.
3. Click **Load unpacked** and select the `/extension` directory in this repository.

---

## 🔬 Benchmark Scenarios Included

Pre-configured benchmark scenarios are available directly in the scanner dropdown:
- **`campuskart.shop`** (Benign e-commerce shop – Verifies zero false positive)
- **`login-microsoft-secure.xyz`** (Active Microsoft credential phishing simulation)
- **`paypal-account-verification-portal.com`** (Visual brand spoofing contradiction)
- **`apple-id-suspended-security.top`** (NRD < 7 days old + credential hook)
- **`github.com`** (Benign baseline with Grade A+ security headers)

---

## 📄 License
MIT License. Developed for advanced cybersecurity intelligence and zero-trust threat response.
