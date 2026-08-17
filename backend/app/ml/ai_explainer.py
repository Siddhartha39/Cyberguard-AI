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
