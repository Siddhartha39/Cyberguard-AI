from typing import Optional, Dict, Any, Tuple
from app.schemas.analysis import BrandMatch, DomainIntel, EvidenceItem

def evaluate_brand_contradiction(
    brand_match: BrandMatch,
    domain_intel: DomainIntel,
    target_url: str
) -> Tuple[bool, Optional[EvidenceItem]]:
    if not brand_match.matched_brand or not brand_match.is_contradiction:
        # If genuine brand match on authorized domain
        if brand_match.matched_brand and not brand_match.is_contradiction:
            ev = EvidenceItem(
                category="Brand Consistency",
                name="Authorized Brand Domain",
                weight=0.35,
                contribution=-35.0,  # Strongly reduces risk
                summary=f"Legitimate domain '{domain_intel.registrable_domain}' matches official {brand_match.brand_display_name} infrastructure.",
                severity="SAFE"
            )
            return False, ev
        return False, None

    # Calculate severity based on confidence and domain characteristics
    confidence = brand_match.combined_brand_confidence
    
    if confidence >= 0.75:
        severity = "CRITICAL"
        weight = 0.50
        contribution = +50.0
    elif confidence >= 0.50:
        severity = "HIGH"
        weight = 0.35
        contribution = +35.0
    else:
        severity = "MEDIUM"
        weight = 0.20
        contribution = +20.0

    # Increase severity if newly registered or punycode
    if domain_intel.is_newly_registered:
        contribution += 10.0
        
    summary = (
        f"Brand Identity Contradiction: Content and visuals strongly imitate '{brand_match.brand_display_name}', "
        f"yet domain '{domain_intel.registrable_domain}' is not operated by '{brand_match.brand_official_domain}'."
    )

    evidence_item = EvidenceItem(
        category="Brand-Domain Contradiction",
        name="Unauthorized Brand Impersonation",
        weight=weight,
        contribution=min(55.0, contribution),
        summary=summary,
        severity=severity
    )
    
    return True, evidence_item
