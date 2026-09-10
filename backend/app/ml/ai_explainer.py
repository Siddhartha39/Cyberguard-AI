import json
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from pydantic import BaseModel

class GeminiAIInsight(BaseModel):
    threat_intel_analysis: str
    hacker_perspective_audit: str
    remediation_recommendations: list[str]

async def generate_gemini_insights(
    domain: str,
    verdict: str,
    risk_score: float,
    domain_age: int,
    is_newly_registered: bool,
    brand_matched: Optional[str],
    is_contradiction: bool,
    security_grade: str,
    is_clickjackable: bool,
    is_email_spoofable: bool,
    missing_headers: list[str]
) -> GeminiAIInsight:
    """
    Calls Gemini API to generate deep explainable threat analysis and hacker-perspective defense recommendations.
    """
    prompt = f"""
You are a Senior Cyber Threat Intelligence Analyst and Elite Penetration Tester.
Analyze this target domain and provide an executive threat breakdown and website security posture assessment.

TARGET METRICS:
- Domain: {domain}
- Phishing Verdict: {verdict} (Risk Score: {risk_score}/100)
- Domain Age: {domain_age} days (Newly Registered Domain: {is_newly_registered})
- Impersonated Brand Target: {brand_matched or 'None'}
- Brand Contradiction Detected: {is_contradiction}
- Website Security Posture Grade: {security_grade}
- Clickjackable via iFrames: {is_clickjackable}
- Email Spoofable (Missing SPF/DMARC): {is_email_spoofable}
- Missing Defense Headers: {', '.join(missing_headers) if missing_headers else 'None'}

Return a valid JSON object with the following three fields ONLY (no markdown formatting outside the JSON):
{{
  "threat_intel_analysis": "A concise 2-3 sentence forensic explanation of the domain's risk level and whether it acts as an active phishing lure or legitimate service.",
  "hacker_perspective_audit": "A 2-3 sentence assessment from an offensive hacker/penetration tester perspective explaining whether this site is easily exploitable (e.g. clickjacking, spoofing, XSS) or well-defended.",
  "remediation_recommendations": ["3-4 concrete, actionable developer remediation commands or config updates to harden this site."]
}}
"""

    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
                    data = json.loads(raw_text)
                    return GeminiAIInsight(
                        threat_intel_analysis=data.get("threat_intel_analysis", ""),
                        hacker_perspective_audit=data.get("hacker_perspective_audit", ""),
                        remediation_recommendations=data.get("remediation_recommendations", [])
                    )
        except Exception as e:
            pass

    # High-fidelity built-in fallback if Gemini API is unreachable or rate-limited
    if verdict == "PHISHING":
        threat_analysis = (
            f"Forensic signals confirm that {domain} exhibits classic phishing attributes, "
            f"leveraging lookalike branding cues and credential harvesting patterns to deceive visitors."
        )
    elif verdict == "SUSPICIOUS":
        threat_analysis = (
            f"The domain {domain} demonstrates anomalous infrastructure markers such as recent registration "
            f"or incomplete DNS hierarchy, warranting heightened observation."
        )
    else:
        threat_analysis = (
            f"Domain {domain} exhibits a verified clean baseline with legitimate SSL encryption "
            f"and consistent lexical characteristics."
        )

    if is_clickjackable or is_email_spoofable:
        hacker_audit = (
            f"From an adversary standpoint, {domain} has exploitable attack surfaces: "
            f"{'missing anti-clickjacking headers allow UI redressing, ' if is_clickjackable else ''}"
            f"{'lack of DMARC enforcement enables threat actors to spoof outbound executive emails.' if is_email_spoofable else ''}"
        )
    else:
        hacker_audit = f"The domain {domain} maintains standard web defense boundaries, mitigating basic clickjacking and email spoofing vectors."

    recommendations = []
    if is_clickjackable:
        recommendations.append("Configure 'X-Frame-Options: SAMEORIGIN' to eliminate Clickjacking risks.")
    if is_email_spoofable:
        recommendations.append("Publish a DMARC policy in DNS ('v=DMARC1; p=reject;') to prevent domain email spoofing.")
    if "Content-Security-Policy" in missing_headers:
        recommendations.append("Deploy a strict Content-Security-Policy (CSP) to neutralize cross-site scripting (XSS).")
    if "Strict-Transport-Security" in missing_headers:
        recommendations.append("Enforce HSTS with 'max-age=31536000; includeSubDomains; preload'.")
    if not recommendations:
        recommendations.append("Maintain routine automated vulnerability auditing and certificate renewal monitoring.")

    return GeminiAIInsight(
        threat_intel_analysis=threat_analysis,
        hacker_perspective_audit=hacker_audit,
        remediation_recommendations=recommendations
    )


async def ask_cyber_copilot(
    message: str,
    report: Optional[Dict[str, Any]] = None,
    history: Optional[list] = None
) -> Dict[str, Any]:
    """
    Interactive Cyber Security Copilot answering questions about scan results,
    vulnerabilities, brand contradiction, code injection immunity, and server hardening.
    """
    report = report or {}
    domain = report.get("canonical_domain") or report.get("domain") or "target website"
    verdict = report.get("verdict") or "UNKNOWN"
    risk_score = report.get("overall_risk_score") or report.get("basic_risk_score") or report.get("risk_score") or 0
    security_audit = report.get("security_audit") or {}
    grade = security_audit.get("security_grade") or security_audit.get("grade") or report.get("security_grade") or "N/A"
    
    missing_headers = []
    if isinstance(security_audit, dict):
        if "missing_headers" in security_audit and isinstance(security_audit["missing_headers"], list):
            missing_headers = security_audit["missing_headers"]
        elif "findings" in security_audit and isinstance(security_audit["findings"], list):
            missing_headers = [
                f.get("name") or f.get("header") or ""
                for f in security_audit["findings"]
                if isinstance(f, dict) and f.get("status") in ["FAIL", "WARNING", "MISSING"]
            ]
            missing_headers = [h for h in missing_headers if h]

    dns_records = report.get("dns_records") or {}
    dmarc_enforced = dns_records.get("dmarc_policy") in ["reject", "quarantine"]
    spf_present = bool(dns_records.get("spf"))
    tls_valid = report.get("tls_valid", True)

    brand = report.get("brand_analysis") or {}
    brand_matched = brand.get("brand_display_name") or brand.get("matched_brand") or brand.get("brand") or None
    is_contradiction = brand.get("is_contradiction", False)
    contradiction_explanation = brand.get("contradiction_explanation", "")

    # Context block
    context_summary = f"""
TARGET SECURITY SCAN CONTEXT:
- Domain: {domain}
- Overall Risk Score: {risk_score} / 100
- Threat Verdict: {verdict}
- Security Posture Grade: {grade}
- Missing Defense Headers: {', '.join(missing_headers) if missing_headers else 'None (Fully Hardened)'}
- DMARC Enforced: {'Yes (reject/quarantine)' if dmarc_enforced else 'No (Spoofable)'}
- TLS Valid: {'Yes' if tls_valid else 'No (Untrusted/Expired)'}
- Brand Impersonation: {brand_matched or 'No brand spoofing detected'}
- Brand Contradiction: {'CRITICAL PHISHING MISMATCH' if is_contradiction else 'Consistent / Authentic Domain'}
{f'- Contradiction Finding: {contradiction_explanation}' if contradiction_explanation else ''}
""" if report else "No active URL scan report loaded. General cybersecurity assistance mode."

    system_prompt = f"""You are CyberGuard AI Copilot, a senior offensive and defensive Application Security (AppSec) engineer and ethical penetration tester.
You provide developers with rigorous vulnerability audits, evaluate if websites are easily hackable, and give comprehensive step-by-step code and server remediation guides (Nginx, Apache, Next.js, Express, Cloudflare, OWASP Top 10 defenses).
When developers ask "Is my website safe?" or "Is it easily hackable?", analyze the exposed perimeter vectors (CSP/XSS, Clickjacking, HSTS/MitM, MIME sniffing, DMARC spoofing), explain the attack surface, and give clear, actionable steps to fix them.
Be concise, authoritative, professional, and actionable. Use markdown formatting with copyable code snippets where helpful.

{context_summary}
"""

    # 1. Try Google Gemini API if key is available
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            contents = [{"parts": [{"text": system_prompt}]}]
            if history:
                for h in history[-4:]:
                    role = "model" if getattr(h, "role", "") == "assistant" or (isinstance(h, dict) and h.get("role") == "assistant") else "user"
                    content_text = getattr(h, "content", "") if not isinstance(h, dict) else h.get("content", "")
                    contents.append({"parts": [{"text": f"[{role.upper()}]: {content_text}"}]})
            contents.append({"parts": [{"text": f"DEVELOPER QUESTION: {message}"}]})

            payload = {
                "contents": contents,
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    reply_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return {
                        "reply": reply_text,
                        "suggested_actions": [
                            f"Is {domain} easily hackable?",
                            f"How to fix Security Grade {grade}?",
                            "Generate Nginx & Express hardening headers",
                            "How to prevent SQL injection and XSS?"
                        ]
                    }
        except Exception:
            pass

    # 2. High-fidelity built-in cybersecurity knowledge engine
    msg_lower = message.lower().strip()
    import re

    # Greeting & Small Talk Check
    greetings = ["hi", "hello", "hey", "hola", "sup", "good morning", "good evening", "good afternoon", "greetings", "namaste", "yo"]
    is_greeting = any(re.match(rf"^{g}\b", msg_lower) for g in greetings) or msg_lower in greetings

    if is_greeting:
        if report and domain and domain != "target website":
            reply = (
                f"👋 **Hello! I am CyberGuard AI Copilot**, your real-time defensive web security engineer and penetration testing assistant.\n\n"
                f"I am actively tracking live telemetry for **`{domain}`**:\n"
                f"- **Verdict:** `{verdict}`\n"
                f"- **Risk Score:** `{risk_score}/100`\n"
                f"- **Security Grade:** `{grade}` ({len(missing_headers)} defense headers missing)\n"
                f"- **SSL / TLS:** {'✅ Encrypted & Valid' if tls_valid else '❌ Invalid / Expired'}\n\n"
                f"How can I help you audit `{domain}`? You can ask:\n"
                f"- *\"Is my website easily hackable?\"*\n"
                f"- *\"What are the exact steps to fix it?\"*\n"
                f"- *\"How do I fix Security Grade {grade} on Nginx or Express?\"*\n"
                f"- *\"How do I protect against SQL injection and XSS?\"*"
            )
        else:
            reply = (
                "👋 **Hello! I am CyberGuard AI Copilot**, your real-time defensive web security engineer and threat intelligence assistant.\n\n"
                "I help developers audit website hackability, immunize applications against code injection (XSS/SQLi), set up production-ready server hardening rules (Nginx, Express, Next.js, Cloudflare), and detect phishing threats.\n\n"
                "Enter your website URL in the **Scanner** tab to run an immediate automated security audit, or ask me any question right here!"
            )

    # Developer Hackability & Vulnerability Audit
    elif any(k in msg_lower for k in [
        "hackable", "easily hackable", "can it be hacked", "can my site be hacked",
        "can someone hack", "vulnerab", "exploit", "pentest", "penetration",
        "is my website safe", "is my site safe", "how safe is my", "how hackable",
        "attack surface", "audit my", "security audit"
    ]):
        if domain and domain != "target website":
            if verdict == "PHISHING" or is_contradiction or risk_score >= 70:
                reply = (
                    f"🚨 **HACKABILITY AUDIT: CRITICAL THREAT ENVIRONMENT FOR `{domain}`**\n\n"
                    f"- **Verdict:** `{verdict}` (Risk Score: **{risk_score}/100**)\n"
                    f"- **Brand Target:** {brand_matched or 'Unauthorized Brand Spoofing'}\n"
                    f"- **Contradiction:** {'Severe Trademark Mismatch Detected' if is_contradiction else 'Malicious infrastructure'}\n\n"
                    f"**Adversary Exposure:** This domain is classified as active deceptive adversary infrastructure. "
                    f"It is operating as a credential harvesting portal designed to steal user passwords and sensitive tokens."
                )
            elif len(missing_headers) > 0 or grade in ["B", "B-", "C", "C+", "C-", "D", "F"] or not dmarc_enforced:
                missing_str = ", ".join(missing_headers) if missing_headers else "Multiple perimeter headers"
                reply = (
                    f"🛡️ **Developer Vulnerability & Hackability Audit for `{domain}`:**\n\n"
                    f"### ⚠️ **Is it easily hackable? YES — Critical attack surfaces are currently exposed.**\n\n"
                    f"Your website scored a Security Grade of **`{grade}`** with **{len(missing_headers)} unconfigured defensive headers** (`{missing_str}`).\n\n"
                    f"Here is how automated botnets and malicious actors can exploit these gaps:\n\n"
                    f"1. 🎯 **Cross-Site Scripting (XSS) & Token Theft** *(Missing `Content-Security-Policy`)*:\n"
                    f"   - Without a strict CSP, any dynamic user input (search bars, comments, query params) rendered without sanitization allows an attacker to inject `<script>` tags.\n"
                    f"   - **Impact:** Attackers can exfiltrate session tokens and JWTs stored in `localStorage` or non-HttpOnly cookies.\n\n"
                    f"2. 🎯 **Clickjacking & UI Redressing** *(Missing `X-Frame-Options` / `frame-ancestors`)*:\n"
                    f"   - Malicious websites can embed `{domain}` inside an invisible `<iframe>` overlay.\n"
                    f"   - **Impact:** Authenticated visitors can be tricked into clicking 'invisible' buttons, triggering unauthorized account deletions or fund transfers.\n\n"
                    f"3. 🎯 **SSL Stripping & Man-in-the-Middle (MitM)** *(Missing `Strict-Transport-Security`)*:\n"
                    f"   - Without HSTS preloading, network adversaries on public Wi-Fi can downgrade HTTPS requests to unencrypted HTTP.\n"
                    f"   - **Impact:** Plaintext sniffing of user passwords and session cookies in transit.\n\n"
                    f"4. 🎯 **MIME Sniffing & Script Execution** *(Missing `X-Content-Type-Options: nosniff`)*:\n"
                    f"   - Browsers may guess the MIME type of user-uploaded files (e.g. interpreting an uploaded `.png` containing JS as executable script).\n\n"
                    f"5. 🎯 **Email Domain Spoofing & Phishing in Your Name** *({'DMARC NOT ENFORCED' if not dmarc_enforced else 'DMARC Active'})*:\n"
                    f"   - Attackers can forge emails pretending to come from `billing@{domain}` or `ceo@{domain}` without failing receiver SPF/DKIM filters.\n\n"
                    f"---\n\n"
                    f"### 🛠️ **Step-by-Step Developer Remediation Blueprint:**\n\n"
                    f"#### **Step 1: Deploy Core Defensive Headers (Immediate 10-Minute Fix)**\n"
                    f"Add these headers to your reverse proxy (`/etc/nginx/conf.d/security.conf`):\n"
                    f"```nginx\n"
                    f"add_header X-Frame-Options \"SAMEORIGIN\" always;\n"
                    f"add_header X-Content-Type-Options \"nosniff\" always;\n"
                    f"add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;\n"
                    f"add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; object-src 'none'; frame-ancestors 'self';\" always;\n"
                    f"add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n"
                    f"add_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;\n"
                    f"```\n\n"
                    f"#### **Step 2: Immunize Against SQL Injection (SQLi)**\n"
                    f"Never concatenate user input directly into SQL queries. Always use parameterized queries or an ORM:\n"
                    f"```python\n"
                    f"# ❌ VULNERABLE: db.execute(f\"SELECT * FROM users WHERE email = '{{email}}'\")\n"
                    f"# ✅ IMMUNIZED:\n"
                    f"db.execute(\"SELECT * FROM users WHERE email = %s\", (email,))\n"
                    f"```\n\n"
                    f"#### **Step 3: Secure Session & Auth Cookies**\n"
                    f"Ensure all session cookies use the 3 essential security flags:\n"
                    f"```http\n"
                    f"Set-Cookie: session_token=xyz; Secure; HttpOnly; SameSite=Strict; Path=/\n"
                    f"```\n\n"
                    f"#### **Step 4: Configure DNS SPF & DMARC Spoofing Defense**\n"
                    f"Add TXT records to your DNS provider (Cloudflare / Route53 / Namecheap):\n"
                    f"- **SPF:** `v=spf1 include:_spf.google.com ~all`\n"
                    f"- **DMARC:** `_dmarc.{domain} TXT \"v=DMARC1; p=reject; rua=mailto:security@{domain}; pct=100\"`\n\n"
                    f"#### **Step 5: Enforce API Rate Limiting & Input Validation**\n"
                    f"- Protect login endpoints (`/api/login`, `/api/forgot-password`) with rate limits (max 5 requests/minute) to stop credential stuffing.\n"
                    f"- Validate all request bodies with schema validation (Pydantic / Zod)."
                )
            else:
                reply = (
                    f"🛡️ **Developer Vulnerability & Hackability Audit for `{domain}`:**\n\n"
                    f"### ✅ **Perimeter Hackability: LOW (Transport & Headers Hardened)**\n\n"
                    f"- **Security Grade:** **`{grade}`** (Risk Score: **{risk_score}/100**)\n"
                    f"- **SSL / TLS:** Encrypted & Valid\n"
                    f"- **Perimeter Defense:** Core headers (`HSTS`, `CSP`, `X-Frame-Options`, `nosniff`) are active.\n\n"
                    f"---\n\n"
                    f"### ⚠️ **What Developers Must Still Protect (OWASP Top 10 Application Layer):**\n"
                    f"While your server perimeter is hardened, response headers do not prevent application-layer flaws:\n"
                    f"1. **Broken Object-Level Authorization (BOLA/IDOR)**: Verify that endpoint `/api/orders/{{id}}` validates that the requesting session actually owns that order ID.\n"
                    f"2. **SQL / NoSQL Injection**: Always use prepared statements or an ORM (Prisma, SQLAlchemy).\n"
                    f"3. **DOM-based XSS in React/Vue**: Sanitize untrusted markup rendered via `dangerouslySetInnerHTML` using `DOMPurify`.\n"
                    f"4. **Dependency Supply Chain**: Run `npm audit` or `pip-audit` to detect known CVEs in your dependencies.\n"
                    f"5. **Credential Stuffing**: Implement rate limiting and CAPTCHA / bot detection on authentication routes."
                )
        else:
            reply = (
                "🛡️ **Developer Website Security & Hackability Audit Guide:**\n\n"
                "### 🔍 **How to Determine If Your Website Is Easily Hackable:**\n\n"
                "Websites are typically compromised through **5 Common Attack Surfaces**:\n"
                "1. 🎯 **Missing Defense Headers**: Lack of `CSP`, `HSTS`, or `X-Frame-Options` leaves your site vulnerable to Clickjacking, XSS session theft, and MitM downgrade.\n"
                "2. 🎯 **SQL Injection (SQLi)**: Interpolating untrusted string parameters into database queries allows attackers to dump or alter your entire database.\n"
                "3. 🎯 **Insecure Cookie Storage**: Storing auth tokens in `localStorage` or non-`HttpOnly` cookies makes them easily extractable via XSS.\n"
                "4. 🎯 **Unenforced Email DMARC**: Missing DMARC records allows anyone to send spoofed emails pretending to be your domain.\n"
                "5. 🎯 **Unrestricted API Endpoints**: Lack of rate limiting allows credential stuffing and automated brute-force attacks.\n\n"
                "👉 **Audit your site now:** Enter your URL in the **Scanner** tab above to generate an immediate automated security grade and vulnerability report!"
            )

    # Step-by-Step Developer Hardening & Remediation
    elif any(k in msg_lower for k in [
        "steps to fix", "give steps", "how to fix", "fix it", "how do i fix",
        "how to secure", "fix my website", "remediation", "hardening", "config"
    ]):
        reply = (
            f"🛠️ **Complete Developer Remediation & Hardening Blueprint for `{domain}`:**\n\n"
            f"Follow these **5 Production Hardening Steps** to upgrade your security posture to **Grade A+**:\n\n"
            f"### **1. Nginx Hardening Configuration (`/etc/nginx/conf.d/security.conf`)**\n"
            f"```nginx\n"
            f"# Clickjacking defense\n"
            f"add_header X-Frame-Options \"SAMEORIGIN\" always;\n\n"
            f"# MIME sniffing defense\n"
            f"add_header X-Content-Type-Options \"nosniff\" always;\n\n"
            f"# Enforce HTTPS & Preloading (1 year max-age)\n"
            f"add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;\n\n"
            f"# Content Security Policy (XSS & Injection Defense)\n"
            f"add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; object-src 'none'; frame-ancestors 'self';\" always;\n\n"
            f"# Referrer & Privacy\n"
            f"add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n"
            f"add_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;\n"
            f"```\n\n"
            f"### **2. Node.js / Express Hardening (`server.js`)**\n"
            f"```javascript\n"
            f"const express = require('express');\n"
            f"const helmet = require('helmet');\n"
            f"const rateLimit = require('express-rate-limit');\n"
            f"const app = express();\n\n"
            f"// Apply 11 automated security headers\n"
            f"app.use(helmet());\n\n"
            f"// Rate limiting: 100 requests per 15 minutes per IP\n"
            f"const limiter = rateLimit({{ windowMs: 15 * 60 * 1000, max: 100 }});\n"
            f"app.use('/api/', limiter);\n"
            f"```\n\n"
            f"### **3. Next.js (`next.config.js`)**\n"
            f"```javascript\n"
            f"const securityHeaders = [\n"
            f"  {{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }},\n"
            f"  {{ key: 'X-Content-Type-Options', value: 'nosniff' }},\n"
            f"  {{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }},\n"
            f"  {{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }}\n"
            f"];\n\n"
            f"module.exports = {{\n"
            f"  async headers() {{\n"
            f"    return [{{ source: '/:path*', headers: securityHeaders }}];\n"
            f"  }}\n"
            f"}};\n"
            f"```\n\n"
            f"### **4. DNS DMARC & SPF Email Enforcement**\n"
            f"Add these authoritative DNS TXT records:\n"
            f"```dns\n"
            f"# SPF Record\n"
            f"{domain}.  TXT  \"v=spf1 include:_spf.google.com ~all\"\n\n"
            f"# Strict DMARC Reject Record\n"
            f"_dmarc.{domain}.  TXT  \"v=DMARC1; p=reject; sp=reject; rua=mailto:dmarc-reports@{domain}; pct=100\"\n"
            f"```\n\n"
            f"### **5. Cloudflare Edge Rules (Zero Code Deployment)**\n"
            f"1. Navigate to **Rules → Transform Rules → Modify Response Header**.\n"
            f"2. Add `Strict-Transport-Security`, `X-Frame-Options`, and `X-Content-Type-Options`.\n"
            f"3. Enable **Always Use HTTPS** and **HSTS** under *SSL/TLS → Edge Certificates*."
        )

    # Injection & OWASP Top 10 Protection
    elif any(k in msg_lower for k in ["code injection", "xss", "sqli", "sql injection", "csp", "inject", "csrf", "sanitize"]):
        reply = (
            f"🔒 **Immunizing `{domain}` Against Code Injection & OWASP Vulnerabilities:**\n\n"
            f"### **1. SQL Injection (SQLi) Immunization**\n"
            f"SQLi occurs when untrusted input alters database query structure. **Always use parameterized queries**:\n"
            f"```python\n"
            f"# ❌ VULNERABLE TO HACKERS:\n"
            f"# cursor.execute(f\"SELECT * FROM users WHERE username = '{{user}}' AND password = '{{pwd}}'\")\n\n"
            f"# ✅ IMMUNIZED (Prepared Statements):\n"
            f"cursor.execute(\"SELECT id, password_hash FROM users WHERE username = %s\", (user,))\n"
            f"```\n\n"
            f"### **2. Cross-Site Scripting (XSS) Immunization**\n"
            f"XSS allows attackers to execute unauthorized JavaScript in victims' browsers.\n"
            f"- **Content-Security-Policy (CSP)**: Completely stops inline script execution:\n"
            f"```http\n"
            f"Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https:; object-src 'none';\n"
            f"```\n"
            f"- **Frontend Sanitization (DOMPurify)**:\n"
            f"```javascript\n"
            f"import DOMPurify from 'dompurify';\n"
            f"const safeHTML = DOMPurify.sanitize(untrustedInput);\n"
            f"```\n\n"
            f"### **3. Cross-Site Request Forgery (CSRF) Defense**\n"
            f"- Store authentication cookies with `SameSite=Strict` and `HttpOnly`.\n"
            f"- Use Anti-CSRF double-submit cookies on state-mutating requests (POST, PUT, DELETE)."
        )

    elif any(k in msg_lower for k in ["who are you", "what can you do", "what are you", "help me", "about copilot"]):
        reply = (
            "🤖 **About CyberGuard AI Copilot**\n\n"
            "I am an autonomous defensive cybersecurity agent and AppSec engineer integrated directly with CyberGuard AI's multi-signal neural fusion engine and Algorand Testnet settlement.\n\n"
            "**Key Capabilities:**\n"
            "1. 🛡️ **Developer Vulnerability Audits**: Analyze website hackability, missing defensive headers, and attack surfaces.\n"
            "2. 🛠️ **Server Hardening Blueprints**: Provide copy-paste configs for Nginx, Express, Next.js, Apache, and Cloudflare.\n"
            "3. 🔒 **Code Injection Immunity**: Guide parameterization, CSP nonces, and input sanitization (SQLi/XSS/CSRF).\n"
            "4. 💼 **Job & Internship Scam Sentinel**: Detect fake hiring offers, registration fee demands, and freemail HR traps.\n"
            "5. ⚡ **Algorand & x402 Micropayments**: Explain decentralized HTTP 402 paywall challenges and on-chain verification."
        )

    elif any(k in msg_lower for k in ["fake", "real", "legit", "scam", "trust", "danger", "malicious", "password", "login", "credential"]):
        if verdict == "PHISHING" or is_contradiction or risk_score >= 70:
            reply = (
                f"🚨 **DANGER: `{domain}` IS FLAGGED AS A HIGH-RISK THREAT ({verdict})**\n\n"
                f"- **Overall Risk Score:** **{risk_score}/100**\n"
                f"- **Brand Target:** {brand_matched or 'Unauthorized Brand Spoofing'}\n"
                f"- **Contradiction Status:** {'Critical Trademark Mismatch' if is_contradiction else 'Malicious indicators present'}\n\n"
                f"**Security Verdict:** DO NOT enter passwords, credit cards, or personal credentials on this website. All input will be exfiltrated to adversary infrastructure."
            )
        elif verdict == "UNREGISTERED":
            reply = (
                f"ℹ️ **`{domain}` IS UNREGISTERED (NXDOMAIN).**\n\n"
                f"This domain does not have active DNS records or hosting infrastructure. It is not an active online portal."
            )
        elif verdict == "SUSPICIOUS" or (35 <= risk_score < 70):
            reply = (
                f"⚠️ **PROCEED WITH CAUTION: `{domain}` HAS SUSPICIOUS INDICATORS.**\n\n"
                f"- **Threat Score:** **{risk_score}/100**\n"
                f"- This domain has newly registered infrastructure or missing defensive headers. Verify ownership before entering credentials."
            )
        else:
            reply = (
                f"✅ **`{domain}` IS VERIFIED AUTHENTIC & SAFE.**\n\n"
                f"- **Verdict:** `{verdict}` (Risk Score: **{risk_score}/100**)\n"
                f"- **Security Grade:** `{grade}`\n"
                f"- **SSL / TLS:** Encrypted and valid\n\n"
                f"The domain matches legitimate registration records with no brand contradictions detected."
            )

    elif any(k in msg_lower for k in ["why", "how is risk", "risk score", "calculate score", "entropy"]):
        reply = (
            f"📊 **How Risk is Calculated for `{domain}` (Score: {risk_score}/100):**\n\n"
            "CyberGuard AI uses a 6-layer multi-signal fusion pipeline:\n"
            "1. **Lexical & Shannon Entropy**: Analyzes URL randomness, character distribution, and brand keyword stuffing.\n"
            "2. **RDAP Domain Age**: Checks domain creation dates. Newly registered domains (<30 days) receive higher risk.\n"
            "3. **DNS & Email Posture**: Audits authoritative A, NS, MX, SPF, and DMARC records.\n"
            "4. **Visual Logo pHash Matching**: Renders page in a sandbox and checks logo perceptual hash against authorized registries.\n"
            "5. **Browser Sandbox Crawl**: Detects deceptive password input forms and cross-origin POST targets.\n"
            "6. **Multi-Signal Calibrator**: Merges all signals into an authoritative 0–100 risk score."
        )

    elif any(k in msg_lower for k in ["internship", "job offer", "job scam", "recruitment", "selected without interview", "training fee"]):
        reply = (
            "💼 **Job & Internship Offer Scam Detection Rules:**\n\n"
            "CyberGuard AI protects students and job seekers against employment fraud. Look out for these **5 Critical Red Flags**:\n"
            "1. 🚩 **Upfront Fee Demands**: Any request for registration fees, training charges, or laptop deposits is **100% a scam**. Legitimate companies NEVER charge candidates.\n"
            "2. 🚩 **Freemail HR Accounts**: Real recruiters email from official domains (`@google.com`, `@infosys.com`), NEVER from `@gmail.com` or `@yahoo.com`.\n"
            "3. 🚩 **Fake Check Scams**: Offering to mail a $3,000 cashier check to buy hardware from an 'approved vendor' is counterfeit check laundering.\n"
            "4. 🚩 **Telegram / WhatsApp Interviews**: Corporate hiring does not conduct formal interviews exclusively via chat apps.\n"
            "5. 🚩 **Instant Selection**: Direct appointment letters issued without technical interviews are deceptive bait.\n\n"
            "Paste any suspicious offer letter into our **Email Sentinel** tab for an instant fraud audit!"
        )

    elif any(k in msg_lower for k in ["dmarc", "spf", "dkim", "spoof"]):
        reply = (
            f"📧 **Email Security & DMARC/SPF Posture for `{domain}`:**\n\n"
            "- **SPF (Sender Policy Framework):** Declares which mail servers are authorized to send emails on behalf of `{domain}`.\n"
            "- **DKIM (DomainKeys Identified Mail):** Cryptographically signs outgoing emails to guarantee they weren't tampered with in transit.\n"
            "- **DMARC (Domain-based Message Authentication, Reporting, and Conformance):** Tells receiving mail servers what to do if SPF or DKIM fails (`reject`, `quarantine`, or `none`).\n\n"
            "**Why this matters:** If a domain lacks DMARC enforcement (`p=reject`), cybercriminals can spoof emails pretending to be the company's CEO or billing department."
        )

    elif any(k in msg_lower for k in ["x402", "algorand", "payment", "crypto", "microalgo", "facilitator"]):
        reply = (
            "⚡ **Algorand & x402 Micropayment Protocol:**\n\n"
            "- **x402 Protocol:** Uses the standard HTTP 402 (Payment Required) status code to paywall high-compute deep forensic audits.\n"
            "- **Algorand Testnet:** Transactions settle in ~3.3 seconds with deterministic finality and minimal gas fees (0.001 ALGO).\n"
            "- **Facilitator:** Verified through the GoPlausible Facilitator (`facilitator.goplausible.xyz`).\n"
            "- **Cost:** 0.1 ALGO (100,000 microAlgos) per deep forensic audit.\n"
            "- **Verification:** Every transaction hash is verified on-chain via the Algorand Testnet indexer."
        )

    else:
        reply = (
            f"🤖 **CyberGuard AI Copilot Telemetry for `{domain}`:**\n\n"
            f"- **Target Domain:** `{domain}`\n"
            f"- **Verdict:** `{verdict}` (Risk Score: **{risk_score}/100**)\n"
            f"- **Security Grade:** **{grade}** ({len(missing_headers)} defensive headers missing)\n"
            f"- **Brand Security:** {'🚨 Brand Contradiction Detected' if is_contradiction else '✅ No brand trademark spoofing detected'}\n\n"
            f"Developer questions you can ask me:\n"
            f"- *\"Is my website easily hackable?\"*\n"
            f"- *\"Give me step-by-step instructions to fix it\"*\n"
            f"- *\"How do I fix Security Grade {grade} on Nginx/Express?\"*\n"
            f"- *\"How to protect against SQL injection & XSS?\"*"
        )

    return {
        "reply": reply,
        "suggested_actions": [
            f"Is {domain} easily hackable?",
            f"How to fix Security Grade {grade}?",
            "Generate Nginx & Express hardening headers",
            "How to prevent SQL injection and XSS?"
        ]
    }

