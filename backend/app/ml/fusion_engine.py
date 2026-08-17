from typing import Tuple, List, Dict, Any, Optional
from app.schemas.analysis import (
    TriageScore,
    DomainIntel,
    CrawlArtifacts,
    BrandMatch,
    EvidenceItem,
    RiskScoreReport
)
from app.ml.contradiction import evaluate_brand_contradiction
from app.ml.attack_chain import reconstruct_attack_chain
from datetime import datetime, timezone

def calculate_multi_signal_fusion(
    case_id: str,
    target_url: str,
    canonical_domain: str,
    triage: TriageScore,
    domain_intel: DomainIntel,
    crawl_artifacts: Optional[CrawlArtifacts],
    brand_match: BrandMatch
) -> RiskScoreReport:
    evidence_list: List[EvidenceItem] = []
    
    # 1. Lexical / URL Model Signal
    score_lexical = triage.lexical_score
    if triage.lexical_score >= 0.75:
        evidence_list.append(EvidenceItem(
            category="URL Lexical",
            name="High Lexical Anomaly Score",
            weight=0.25,
            contribution=+25.0 * triage.lexical_score,
            summary=f"Fast triage classifier produced high phishing probability ({triage.lexical_score:.2f}). {triage.triage_reason}",
            severity="HIGH"
        ))
    elif triage.lexical_score <= 0.15:
        evidence_list.append(EvidenceItem(
            category="URL Lexical",
            name="Clean URL Lexical Profile",
            weight=0.15,
            contribution=-15.0,
            summary="URL structure, length, and entropy are consistent with standard benign domains.",
            severity="SAFE"
        ))

    # Add specific lexical attributions
    for attr_name, attr_val in triage.feature_attributions.items():
        evidence_list.append(EvidenceItem(
            category="Lexical Feature",
            name=attr_name,
            weight=0.10,
            contribution=attr_val * 20.0,
            summary=f"Detected specific lexical risk signal: {attr_name}.",
            severity="MEDIUM" if attr_val < 0.35 else "HIGH"
        ))

    # 2. Domain & Infrastructure Signals
    infra_risk = 0.0
    if domain_intel.is_newly_registered:
        infra_risk += 0.45
        evidence_list.append(EvidenceItem(
            category="Domain Intelligence",
            name="Newly Registered Domain (NRD)",
            weight=0.25,
            contribution=+25.0,
            summary=f"Domain registered recently ({domain_intel.domain_age_days} days ago). Early registration is a key phishing precursor.",
            severity="HIGH"
        ))
    else:
        evidence_list.append(EvidenceItem(
            category="Domain Intelligence",
            name="Established Domain Age",
            weight=0.15,
            contribution=-15.0,
            summary=f"Domain has an established registration history (> {domain_intel.domain_age_days} days).",
            severity="SAFE"
        ))

    if domain_intel.tls_is_self_signed:
        infra_risk += 0.30
        evidence_list.append(EvidenceItem(
            category="Infrastructure",
            name="Self-Signed / Untrusted Certificate",
            weight=0.15,
            contribution=+15.0,
            summary="TLS certificate is self-signed or issuer is untrusted.",
            severity="HIGH"
        ))
    elif domain_intel.tls_valid:
        evidence_list.append(EvidenceItem(
            category="Infrastructure",
            name="Valid TLS Encryption",
            weight=0.05,
            contribution=-5.0,
            summary=f"Valid TLS certificate issued by {domain_intel.tls_issuer or 'Trusted CA'}.",
            severity="SAFE"
        ))

    if not domain_intel.dns.mx_records and not domain_intel.dns.a_records:
        infra_risk += 0.20
        evidence_list.append(EvidenceItem(
            category="DNS Intelligence",
            name="Incomplete DNS Hierarchy",
            weight=0.10,
            contribution=+10.0,
            summary="Domain lacks standard MX/A DNS records.",
            severity="MEDIUM"
        ))
    score_infrastructure = min(1.0, infra_risk)

    # 3. Content & DOM Behavior Signals
    content_risk = 0.0
    if crawl_artifacts:
        if len(crawl_artifacts.redirect_chain) > 2:
            content_risk += 0.25
            evidence_list.append(EvidenceItem(
                category="Navigation Behavior",
                name="Multi-Hop Redirection Chain",
                weight=0.15,
                contribution=+15.0,
                summary=f"Observed {len(crawl_artifacts.redirect_chain) - 1} redirects before arriving at target.",
                severity="MEDIUM"
            ))

        if crawl_artifacts.has_password_field:
            content_risk += 0.35
            evidence_list.append(EvidenceItem(
                category="DOM Behavior",
                name="Credential Harvesting Inputs",
                weight=0.25,
                contribution=+25.0,
                summary="Page renders interactive password/security credential input fields.",
                severity="HIGH"
            ))

        if crawl_artifacts.has_obfuscated_js:
            content_risk += 0.30
            evidence_list.append(EvidenceItem(
                category="Script Analysis",
                name="Obfuscated Script Execution",
                weight=0.20,
                contribution=+20.0,
                summary="Detected JavaScript obfuscation constructs (eval/atob/charcode decoding).",
                severity="HIGH"
            ))

        cross_origin_forms = [f for f in crawl_artifacts.forms if f.is_cross_origin]
        if cross_origin_forms:
            content_risk += 0.25
            evidence_list.append(EvidenceItem(
                category="Form Behavior",
                name="Cross-Origin Form Dispatch",
                weight=0.20,
                contribution=+20.0,
                summary=f"Form submissions are posted to an external cross-origin target ({cross_origin_forms[0].action}).",
                severity="HIGH"
            ))
    score_content = min(1.0, content_risk)

    # 4. Visual & Brand Contradiction Signals (The Major Differentiator)
    score_visual = brand_match.combined_brand_confidence
    has_contradiction, contra_ev = evaluate_brand_contradiction(brand_match, domain_intel, target_url)
    if contra_ev:
        evidence_list.append(contra_ev)

    # 5. Reputation Score
    score_reputation = 0.0 # Pluggable threat intel

    # Calibrated Risk Aggregation
    # Formula: Baseline weighted sum + Contradiction escalation
    raw_score = (
        0.25 * (score_lexical * 100.0) +
        0.20 * (score_infrastructure * 100.0) +
        0.25 * (score_content * 100.0) +
        0.30 * (score_visual * 100.0 if has_contradiction else 0.0)
    )

    # If severe brand contradiction + password field detected, force critical risk
    if has_contradiction and crawl_artifacts and crawl_artifacts.has_password_field:
        raw_score = max(raw_score, 88.0)
    elif has_contradiction and domain_intel.is_newly_registered:
        raw_score = max(raw_score, 82.0)
    elif not has_contradiction and brand_match.matched_brand and not domain_intel.is_newly_registered:
        # Verified authentic brand
        raw_score = min(raw_score, 12.0)

    # Clean benign site adjustment
    if score_lexical < 0.15 and not domain_intel.is_newly_registered and not has_contradiction:
        raw_score = min(raw_score, 10.0)

    overall_risk_score = round(max(0.0, min(100.0, raw_score)), 1)

    # Verdict & Recommended Action
    if overall_risk_score >= 70.0:
        verdict = "PHISHING"
        recommended_action = "CRITICAL: Isolate host, block domain at DNS/Gateway level, and alert affected users."
    elif overall_risk_score >= 40.0:
        verdict = "SUSPICIOUS"
        recommended_action = "WARNING: Flag for tier-2 SOC analyst inspection; monitor incoming traffic."
    else:
        verdict = "BENIGN"
        recommended_action = "SAFE: Domain matches legitimate baseline; allow traffic."

    confidence = round(0.70 + (0.28 * abs(overall_risk_score - 50.0) / 50.0), 2)

    # Reconstruct explainable attack chain
    attack_chain = reconstruct_attack_chain(
        target_url=target_url,
        triage=triage,
        domain_intel=domain_intel,
        crawl=crawl_artifacts,
        brand=brand_match,
        overall_risk=overall_risk_score
    )

    return RiskScoreReport(
        case_id=case_id,
        target_url=target_url,
        canonical_domain=canonical_domain,
        timestamp=datetime.now(timezone.utc).isoformat(),
        overall_risk_score=overall_risk_score,
        verdict=verdict,
        confidence=confidence,
        recommended_action=recommended_action,
        score_lexical=round(score_lexical, 3),
        score_infrastructure=round(score_infrastructure, 3),
        score_content_behavior=round(score_content, 3),
        score_visual_brand=round(score_visual, 3),
        score_reputation=score_reputation,
        brand_analysis=brand_match,
        attack_chain=attack_chain,
        evidence_breakdown=evidence_list,
        triage=triage,
        domain_intel=domain_intel,
        crawl_artifacts=crawl_artifacts
    )
