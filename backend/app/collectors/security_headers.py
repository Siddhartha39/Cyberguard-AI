import asyncio
from typing import Dict, Any, List, Optional
import httpx
from pydantic import BaseModel, Field

class HeaderAuditItem(BaseModel):
    name: str
    status: str  # PASS, FAIL, WARNING
    value: Optional[str] = None
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    exploit_risk: str
    remediation: str

class SecurityPostureAudit(BaseModel):
    security_grade: str  # A+, A, B, C, D, F
    score_percentage: float  # 0 - 100
    is_clickjackable: bool
    is_email_spoofable: bool
    has_hsts: bool
    has_csp: bool
    findings: List[HeaderAuditItem]
    hacker_perspective_summary: str
    key_vulnerabilities: List[str]
    remediation_steps: List[str]

async def audit_security_headers_and_dns(url: str, txt_records: List[str]) -> SecurityPostureAudit:
    findings: List[HeaderAuditItem] = []
    headers: Dict[str, str] = {}
    
    try:
        async with httpx.AsyncClient(timeout=4.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(url, headers={"User-Agent": "CyberGuardSecurityAuditor/2.0"})
            headers = {k.lower(): v for k, v in resp.headers.items()}
    except Exception:
        pass

    # 1. Content Security Policy (CSP)
    csp = headers.get("content-security-policy")
    if csp:
        findings.append(HeaderAuditItem(
            name="Content-Security-Policy (CSP)",
            status="PASS",
            value=csp[:80] + "..." if len(csp) > 80 else csp,
            severity="INFO",
            exploit_risk="Protected: Restricts unauthorized script injection and XSS payloads.",
            remediation="Maintain regular policy review and enforce strict script nonces/hashes."
        ))
        has_csp = True
    else:
        findings.append(HeaderAuditItem(
            name="Content-Security-Policy (CSP)",
            status="FAIL",
            value="Missing",
            severity="HIGH",
            exploit_risk="VULNERABLE: Attackers can inject malicious third-party scripts, stolen session cookies, or keyloggers (XSS).",
            remediation="Add 'Content-Security-Policy: default-src 'self'; script-src 'self' ...' header."
        ))
        has_csp = False

    # 2. Strict-Transport-Security (HSTS)
    hsts = headers.get("strict-transport-security")
    if hsts:
        findings.append(HeaderAuditItem(
            name="Strict-Transport-Security (HSTS)",
            status="PASS",
            value=hsts,
            severity="INFO",
            exploit_risk="Protected: Forces secure encrypted HTTPS connections, mitigating SSL-stripping attacks.",
            remediation="Ensure 'includeSubDomains; preload' directives are set."
        ))
        has_hsts = True
    else:
        findings.append(HeaderAuditItem(
            name="Strict-Transport-Security (HSTS)",
            status="FAIL",
            value="Missing",
            severity="HIGH",
            exploit_risk="VULNERABLE: Susceptible to Man-in-the-Middle (MitM) and HTTP downgrade attacks on public Wi-Fi.",
            remediation="Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'."
        ))
        has_hsts = False

    # 3. Clickjacking Protection (X-Frame-Options / frame-ancestors)
    xfo = headers.get("x-frame-options")
    csp_frames = "frame-ancestors" in (csp or "")
    if xfo or csp_frames:
        findings.append(HeaderAuditItem(
            name="X-Frame-Options (Anti-Clickjacking)",
            status="PASS",
            value=xfo or "Enforced via CSP frame-ancestors",
            severity="INFO",
            exploit_risk="Protected: Prevents attackers from embedding your website inside malicious invisible iframes.",
            remediation="Keep 'X-Frame-Options: DENY' or 'SAMEORIGIN' configured."
        ))
        is_clickjackable = False
    else:
        findings.append(HeaderAuditItem(
            name="X-Frame-Options (Anti-Clickjacking)",
            status="FAIL",
            value="Missing",
            severity="HIGH",
            exploit_risk="EASILY HACKABLE / CLICKJACKABLE: Attackers can iframe your UI into a deceptive wrapper and trick users into clicking buttons (Clickjacking).",
            remediation="Set 'X-Frame-Options: SAMEORIGIN' or 'Content-Security-Policy: frame-ancestors 'self''."
        ))
        is_clickjackable = True

    # 4. MIME-Sniffing Prevention
    xcto = headers.get("x-content-type-options")
    if xcto and "nosniff" in xcto.lower():
        findings.append(HeaderAuditItem(
            name="X-Content-Type-Options",
            status="PASS",
            value=xcto,
            severity="INFO",
            exploit_risk="Protected: Browser strictly respects declared MIME types.",
            remediation="Keep 'X-Content-Type-Options: nosniff'."
        ))
    else:
        findings.append(HeaderAuditItem(
            name="X-Content-Type-Options",
            status="WARNING",
            value="Missing",
            severity="MEDIUM",
            exploit_risk="RISKY: Browsers may execute benign uploaded files (like images) as malicious JavaScript.",
            remediation="Add 'X-Content-Type-Options: nosniff'."
        ))

    # 5. Referrer-Policy
    ref = headers.get("referrer-policy")
    if ref:
        findings.append(HeaderAuditItem(
            name="Referrer-Policy",
            status="PASS",
            value=ref,
            severity="INFO",
            exploit_risk="Protected: Strips sensitive URLs and parameters from third-party requests.",
            remediation="Maintain 'strict-origin-when-cross-origin' or 'no-referrer'."
        ))
    else:
        findings.append(HeaderAuditItem(
            name="Referrer-Policy",
            status="WARNING",
            value="Missing",
            severity="LOW",
            exploit_risk="RISK OF LEAKAGE: Full path URLs and private query tokens may leak to third-party analytics.",
            remediation="Set 'Referrer-Policy: strict-origin-when-cross-origin'."
        ))

    # 6. Email Spoofing Defense (SPF & DMARC in DNS)
    has_spf = any("v=spf1" in txt.lower() for txt in txt_records)
    has_dmarc = any("v=dmarc1" in txt.lower() for txt in txt_records)

    if has_spf and has_dmarc:
        findings.append(HeaderAuditItem(
            name="Email Spoofing Defense (SPF / DMARC)",
            status="PASS",
            value="SPF and DMARC records detected in DNS",
            severity="INFO",
            exploit_risk="Protected: Hackers cannot easily forge emails pretending to come from your official domain.",
            remediation="Ensure DMARC policy is set to 'p=reject' or 'p=quarantine'."
        ))
        is_email_spoofable = False
    elif has_spf:
        findings.append(HeaderAuditItem(
            name="Email Spoofing Defense (DMARC missing)",
            status="WARNING",
            value="SPF present, DMARC missing",
            severity="MEDIUM",
            exploit_risk="PARTIALLY VULNERABLE: Attackers can bypass SPF alignment and spoof executive emails without strict DMARC enforcement.",
            remediation="Add a TXT record at '_dmarc.yourdomain.com' with 'v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com'."
        ))
        is_email_spoofable = True
    else:
        findings.append(HeaderAuditItem(
            name="Email Spoofing Defense (SPF & DMARC Missing)",
            status="FAIL",
            value="No SPF/DMARC in DNS",
            severity="HIGH",
            exploit_risk="EASILY SPOOFABLE: Anyone in the world can send fraudulent emails from 'admin@yourdomain.com' with zero forgery resistance.",
            remediation="Publish SPF 'v=spf1 mx ~all' and DMARC records in DNS immediately."
        ))
        is_email_spoofable = True

    # Calculate Grade
    passes = sum(1 for f in findings if f.status == "PASS")
    total = len(findings)
    score_percentage = round((passes / total) * 100, 1)

    if score_percentage >= 85:
        grade = "A+"
        hacker_summary = "Hardened Defense Posture: Modern security headers and anti-spoofing policies are well-configured."
    elif score_percentage >= 70:
        grade = "B"
        hacker_summary = "Moderate Security Posture: Basic protections active, but missing critical modern headers (like CSP or strict HSTS)."
    elif score_percentage >= 45:
        grade = "C"
        hacker_summary = "Elevated Exploitability: Lacks fundamental browser isolation headers and email authentication. Vulnerable to Clickjacking or XSS injection."
    else:
        grade = "F"
        hacker_summary = "Critical Security Deficit: Missing essential security headers and DNS email authentication. Easily exploitable via Clickjacking and Domain Spoofing."

    key_vulns = [f.exploit_risk for f in findings if f.status == "FAIL"]
    remediations = [f.remediation for f in findings if f.status in ["FAIL", "WARNING"]]

    return SecurityPostureAudit(
        security_grade=grade,
        score_percentage=score_percentage,
        is_clickjackable=is_clickjackable,
        is_email_spoofable=is_email_spoofable,
        has_hsts=has_hsts,
        has_csp=has_csp,
        findings=findings,
        hacker_perspective_summary=hacker_summary,
        key_vulnerabilities=key_vulns,
        remediation_steps=remediations
    )
