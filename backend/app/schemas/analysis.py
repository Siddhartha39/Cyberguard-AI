from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalysisRequest(BaseModel):
    url: str = Field(..., description="Target URL or domain to analyze")
    deep_analysis: bool = Field(True, description="Whether to execute browser sandbox and visual matching")
    force_refresh: bool = Field(False, description="Bypass cache and force re-crawling")
    payment_tx_id: Optional[str] = Field(None, description="Optional Algorand Testnet Transaction ID if unlocking premium deep audit")

class TriageScore(BaseModel):
    lexical_score: float = Field(..., description="0.0 to 1.0 fast triage probability")
    is_suspicious: bool = Field(..., description="Whether triage flags domain for escalation")
    triage_reason: str
    feature_attributions: Dict[str, float] = Field(default_factory=dict)

class DNSRecords(BaseModel):
    a_records: List[str] = Field(default_factory=list)
    aaaa_records: List[str] = Field(default_factory=list)
    mx_records: List[str] = Field(default_factory=list)
    ns_records: List[str] = Field(default_factory=list)
    txt_records: List[str] = Field(default_factory=list)
    ttl_average: Optional[int] = None
    dns_status: str = "RESOLVED"  # RESOLVED, NXDOMAIN, NO_RECORDS, TIMEOUT

class DomainIntel(BaseModel):
    registrable_domain: str
    subdomain: Optional[str] = None
    tld: str
    is_registered: bool = True
    registration_status: str = "REGISTERED"  # REGISTERED, UNREGISTERED, UNKNOWN
    domain_age_days: Optional[int] = None
    is_newly_registered: bool = False
    registrar: Optional[str] = None
    creation_date: Optional[str] = None
    dns: DNSRecords = Field(default_factory=DNSRecords)
    tls_valid: Optional[bool] = None
    tls_issuer: Optional[str] = None
    tls_days_remaining: Optional[int] = None
    tls_is_self_signed: bool = False
    ip_geolocation: Optional[Dict[str, Any]] = None

class FormDetail(BaseModel):
    action: str
    method: str
    input_types: List[str]
    has_password: bool = False
    has_credit_card: bool = False
    is_cross_origin: bool = False

class CrawlArtifacts(BaseModel):
    final_url: str
    status_code: int
    redirect_chain: List[str] = Field(default_factory=list)
    title: Optional[str] = None
    dom_text_snippet: Optional[str] = None
    forms: List[FormDetail] = Field(default_factory=list)
    has_password_field: bool = False
    has_obfuscated_js: bool = False
    external_resource_count: int = 0
    external_domains: List[str] = Field(default_factory=list)
    screenshot_url: Optional[str] = None
    screenshot_hash: Optional[str] = None
    crawl_time_ms: int = 0
    error_message: Optional[str] = None

class BrandMatch(BaseModel):
    matched_brand: Optional[str] = None
    brand_display_name: Optional[str] = None
    brand_official_domain: Optional[str] = None
    brand_logo_url: Optional[str] = None
    visual_similarity: float = 0.0
    text_cue_similarity: float = 0.0
    combined_brand_confidence: float = 0.0
    is_contradiction: bool = False
    contradiction_explanation: Optional[str] = None

class AttackChainNode(BaseModel):
    id: str
    step_number: int
    category: str  # ingress, resolution, redirect, landing, form_hook, exfiltration, verdict
    title: str
    description: str
    severity: str  # info, warning, danger, safe
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EvidenceItem(BaseModel):
    category: str
    name: str
    weight: float
    contribution: float  # +ve increases risk, -ve decreases risk
    summary: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, SAFE

class HeaderAuditItem(BaseModel):
    name: str
    status: str  # PASS, FAIL, WARNING
    value: Optional[str] = None
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    exploit_risk: str
    remediation: str

class SecurityPostureAudit(BaseModel):
    security_grade: str = "B"  # A+, A, B, C, D, F
    score_percentage: float = 75.0
    is_clickjackable: bool = False
    is_email_spoofable: bool = False
    has_hsts: bool = True
    has_csp: bool = False
    findings: List[HeaderAuditItem] = Field(default_factory=list)
    hacker_perspective_summary: str = ""
    key_vulnerabilities: List[str] = Field(default_factory=list)
    remediation_steps: List[str] = Field(default_factory=list)

class GeminiAIInsight(BaseModel):
    threat_intel_analysis: str = ""
    hacker_perspective_audit: str = ""
    remediation_recommendations: List[str] = Field(default_factory=list)

class RiskScoreReport(BaseModel):
    case_id: str
    target_url: str
    canonical_domain: str
    timestamp: str
    overall_risk_score: float  # 0.0 to 100.0
    verdict: str  # PHISHING, SUSPICIOUS, BENIGN, UNKNOWN
    confidence: float
    recommended_action: str
    
    # Sub-scores (0.0 to 1.0)
    score_lexical: float
    score_infrastructure: float
    score_content_behavior: float
    score_visual_brand: float
    score_reputation: float
    
    # Core Differentiators
    brand_analysis: BrandMatch
    attack_chain: List[AttackChainNode]
    evidence_breakdown: List[EvidenceItem]
    
    # Raw Metadata
    triage: TriageScore
    domain_intel: DomainIntel
    crawl_artifacts: Optional[CrawlArtifacts] = None

    # Security Posture & Gemini AI
    security_audit: Optional[SecurityPostureAudit] = None
    ai_insights: Optional[GeminiAIInsight] = None

    # x402 & Algorand Testnet Verification
    is_premium: bool = True
    tx_id: Optional[str] = None
    payment_timestamp: Optional[str] = None
    payment_amount_algo: Optional[float] = None
    explorer_url: Optional[str] = None

# Free Quick Scan Result (Rich Stage 1, Stage 2 & TLS/DNS Intelligence)
class FreeScanResult(BaseModel):
    case_id: str
    target_url: str
    canonical_domain: str
    timestamp: str
    basic_risk_score: float
    verdict: str  # BENIGN, SUSPICIOUS, PHISHING, UNREGISTERED
    confidence: float
    lexical_score: float
    entropy_score: float = 0.0
    is_registered: bool = True
    registration_status: str = "REGISTERED"
    is_newly_registered: bool = False
    domain_age_days: Optional[int] = None
    creation_date: Optional[str] = None
    registrar: Optional[str] = None
    dns_a_records: List[str] = Field(default_factory=list)
    dns_ns_records: List[str] = Field(default_factory=list)
    has_spf: bool = False
    has_dmarc: bool = False
    tls_valid: Optional[bool] = None
    tls_issuer: Optional[str] = None
    triage_reason: str
    feature_attributions: Dict[str, float] = Field(default_factory=dict)
    deep_audit_locked: bool = True
    x402_challenge: Optional[Dict[str, Any]] = None

# x402 Challenge & Payment Schemas
class PaymentChallengeRequest(BaseModel):
    target_url: str
    case_id: str

class PaymentChallengeResponse(BaseModel):
    challenge_id: str
    network: str = "algorand-testnet"
    recipient_address: str
    amount_microalgos: int
    amount_algo: float
    token_symbol: str = "ALGO"
    target_url: str
    case_id: str
    created_at: int
    expires_at: int
    facilitator_url: str
    x402_header: str

class PaymentVerificationRequest(BaseModel):
    tx_id: str
    case_id: str
    target_url: str
    challenge_id: Optional[str] = None

class PaymentVerificationResponse(BaseModel):
    verified: bool
    tx_id: Optional[str] = None
    sender_address: Optional[str] = None
    amount_algo: Optional[float] = None
    block_round: Optional[int] = None
    confirmed_at: Optional[str] = None
    explorer_url: Optional[str] = None
    error_message: Optional[str] = None
    report: Optional[RiskScoreReport] = None

class AnalystFeedback(BaseModel):
    case_id: str
    analyst_verdict: str  # CONFIRMED_PHISHING, FALSE_POSITIVE, BENIGN, SUSPICIOUS
    notes: Optional[str] = None
    escalate_to_soc: bool = False

class FeedItem(BaseModel):
    id: str
    domain: str
    discovered_time: str
    source: str
    fast_risk_score: float
    is_escalated: bool = False
    status: str  # queued, triaged, deep_analyzed, ignored
    tags: List[str] = Field(default_factory=list)

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    report: Optional[Dict[str, Any]] = None
    history: Optional[List[ChatMessage]] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = Field(default_factory=list)

class BulkScanRequest(BaseModel):
    urls: List[str]

class BulkScanResponse(BaseModel):
    results: List[FreeScanResult]
    total: int
    phishing_count: int
    suspicious_count: int
    benign_count: int
    unregistered_count: int

class PasswordStrengthRequest(BaseModel):
    password: str

class PasswordStrengthResponse(BaseModel):
    score: int
    strength: str
    crack_time_display: str
    entropy_bits: float
    is_pwned: bool
    pwned_count: int
    suggestions: List[str]

class IpReputationRequest(BaseModel):
    ip: str

class IpReputationResponse(BaseModel):
    ip: str
    is_valid: bool
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    isp: Optional[str] = None
    org: Optional[str] = None
    as_number: Optional[str] = None
    is_proxy: bool = False
    is_hosting: bool = False
    is_tor: bool = False
    abuse_score: int = 0
    risk_level: str = "LOW"
    blacklists: List[str] = []
    reverse_dns: Optional[str] = None

class ScreenshotRequest(BaseModel):
    url: str

class ScreenshotResponse(BaseModel):
    url: str
    available: bool
    screenshot_b64: Optional[str] = None
    title: Optional[str] = None
    error: Optional[str] = None

class WatchlistItem(BaseModel):
    id: str
    domain: str
    label: Optional[str] = None
    added_at: str
    last_scan: Optional[str] = None
    last_verdict: Optional[str] = None
    last_risk_score: Optional[float] = None

class RedFlagItem(BaseModel):
    category: str
    title: str
    description: str
    severity: str

class EmailScamAnalysisRequest(BaseModel):
    email_text: str
    sender_email: Optional[str] = None
    claimed_company: Optional[str] = None

class EmailScamAnalysisResponse(BaseModel):
    email_type: str
    is_scam: bool
    scam_score: int
    confidence: float
    verdict: str
    summary: str
    money_requested: bool
    money_details: Optional[str] = None
    sender_evaluation: str
    red_flags: List[RedFlagItem]
    safety_recommendations: List[str]
    extracted_urls: List[str]

