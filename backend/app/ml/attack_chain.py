from typing import List, Optional, Dict, Any
from app.schemas.analysis import (
    AttackChainNode,
    DomainIntel,
    CrawlArtifacts,
    BrandMatch,
    TriageScore
)

def reconstruct_attack_chain(
    target_url: str,
    triage: TriageScore,
    domain_intel: DomainIntel,
    crawl: Optional[CrawlArtifacts],
    brand: BrandMatch,
    overall_risk: float
) -> List[AttackChainNode]:
    nodes: List[AttackChainNode] = []
    step = 1

    # Node 1: Ingress / Candidate Domain
    ingress_sev = "danger" if triage.is_suspicious else ("warning" if triage.lexical_score > 0.3 else "info")
    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="ingress",
        title="Candidate Ingress & Lexical Triage",
        description=f"Received candidate target URL. Lexical triage score: {triage.lexical_score:.2f}. {triage.triage_reason}",
        severity=ingress_sev,
        metadata={
            "url": target_url,
            "lexical_score": triage.lexical_score,
            "attributions": triage.feature_attributions
        }
    ))
    step += 1

    # Node 2: Infrastructure Resolution & DNS/TLS
    infra_sev = "warning" if domain_intel.is_newly_registered else "safe"
    tls_desc = f"TLS Issuer: {domain_intel.tls_issuer or 'None'} (Valid: {domain_intel.tls_valid})"
    age_desc = f"Domain Age: {domain_intel.domain_age_days} days (Newly registered: {domain_intel.is_newly_registered})"
    
    if domain_intel.is_newly_registered:
        infra_sev = "danger"
        infra_title = "Suspicious Early-Warning Infrastructure"
        infra_desc = f"Newly registered domain ({domain_intel.domain_age_days}d old) resolved to {len(domain_intel.dns.a_records)} IP(s). {tls_desc}."
    else:
        infra_title = "DNS & Infrastructure Resolution"
        infra_desc = f"Established domain resolved across {len(domain_intel.dns.a_records)} A records, {len(domain_intel.dns.ns_records)} NS records. {tls_desc}."

    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="resolution",
        title=infra_title,
        description=infra_desc,
        severity=infra_sev,
        metadata={
            "a_records": domain_intel.dns.a_records,
            "ns_records": domain_intel.dns.ns_records,
            "domain_age_days": domain_intel.domain_age_days,
            "is_newly_registered": domain_intel.is_newly_registered,
            "tls_issuer": domain_intel.tls_issuer
        }
    ))
    step += 1

    # Node 3: Navigation & Observed Redirects
    if crawl and len(crawl.redirect_chain) > 1:
        redirect_count = len(crawl.redirect_chain) - 1
        nodes.append(AttackChainNode(
            id=f"node-{step}",
            step_number=step,
            category="redirect",
            title=f"Multi-Hop Redirect Sequence ({redirect_count} hops)",
            description=f"Observed {redirect_count} redirection hop(s) steering traffic to: {crawl.final_url}",
            severity="warning" if redirect_count > 1 else "info",
            metadata={"redirect_chain": crawl.redirect_chain}
        ))
        step += 1

    # Node 4: Landing Page & Brand Simulation
    if brand.matched_brand:
        if brand.is_contradiction:
            landing_sev = "danger"
            landing_title = f"Lookalike Visual Spoofing ({brand.brand_display_name})"
            landing_desc = (
                f"Page DOM and visuals imitate {brand.brand_display_name} (Confidence: {brand.combined_brand_confidence:.0%}) "
                f"while hosted on unauthorized domain '{domain_intel.registrable_domain}'."
            )
        else:
            landing_sev = "safe"
            landing_title = f"Authentic Brand Landing ({brand.brand_display_name})"
            landing_desc = f"Verified authentic {brand.brand_display_name} landing on authorized domain {brand.brand_official_domain}."
    else:
        landing_sev = "info"
        landing_title = "Generic Landing Page Loaded"
        landing_desc = f"Page loaded with title: '{crawl.title if crawl else 'N/A'}'. No prominent high-value brand spoofing matched."

    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="landing",
        title=landing_title,
        description=landing_desc,
        severity=landing_sev,
        metadata={
            "matched_brand": brand.matched_brand,
            "visual_similarity": brand.visual_similarity,
            "is_contradiction": brand.is_contradiction,
            "page_title": crawl.title if crawl else None
        }
    ))
    step += 1

    # Node 5: Credential / Information Harvesting Hooks
    if crawl and crawl.forms:
        pw_forms = [f for f in crawl.forms if f.has_password or f.has_credit_card]
        cross_origin_forms = [f for f in crawl.forms if f.is_cross_origin]
        
        if pw_forms:
            hook_sev = "danger" if brand.is_contradiction else ("warning" if domain_intel.is_newly_registered else "info")
            hook_title = "Credential Harvesting Form Detected"
            hook_desc = f"Identified form with password/security input fields targeting: {pw_forms[0].action}"
        elif cross_origin_forms:
            hook_sev = "warning"
            hook_title = "Cross-Origin Form Action"
            hook_desc = f"Form submissions dispatched across origins to external endpoint: {cross_origin_forms[0].action}"
        else:
            hook_sev = "info"
            hook_title = "Standard Interaction Forms"
            hook_desc = f"Page contains {len(crawl.forms)} standard web form(s)."

        nodes.append(AttackChainNode(
            id=f"node-{step}",
            step_number=step,
            category="form_hook",
            title=hook_title,
            description=hook_desc,
            severity=hook_sev,
            metadata={"form_count": len(crawl.forms), "has_password": bool(pw_forms)}
        ))
        step += 1

    # Node 6: External Requests & Exfiltration Channels
    if crawl and crawl.external_domains:
        ext_count = len(crawl.external_domains)
        ext_sev = "warning" if (crawl.has_obfuscated_js or ext_count > 5) else "info"
        nodes.append(AttackChainNode(
            id=f"node-{step}",
            step_number=step,
            category="exfiltration",
            title=f"External Asset & Script Connections ({ext_count} remote hosts)",
            description=f"Observed background calls to {ext_count} third-party hosts. Obfuscated JS detected: {crawl.has_obfuscated_js}.",
            severity=ext_sev,
            metadata={
                "external_domains": crawl.external_domains[:6],
                "has_obfuscated_js": crawl.has_obfuscated_js
            }
        ))
        step += 1

    # Node 7: Risk Verdict & Policy Conclusion
    if overall_risk >= 65.0:
        verdict_sev = "danger"
        verdict_title = f"High Risk Phishing Attack Vector ({overall_risk:.0f}/100)"
        verdict_desc = "Multi-signal fusion confirms high-confidence credential phishing. Recommend immediate quarantine or DNS block."
    elif overall_risk >= 35.0:
        verdict_sev = "warning"
        verdict_title = f"Suspicious Activity Detected ({overall_risk:.0f}/100)"
        verdict_desc = "Anomalous indicators detected; further analyst inspection or automated sandboxing advised."
    else:
        verdict_sev = "safe"
        verdict_title = f"Low Risk / Benign Destination ({overall_risk:.0f}/100)"
        verdict_desc = "No high-risk brand contradiction or credential theft heuristics identified."

    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="verdict",
        title=verdict_title,
        description=verdict_desc,
        severity=verdict_sev,
        metadata={"overall_risk_score": overall_risk}
    ))

    return nodes
