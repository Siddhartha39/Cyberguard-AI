export interface TriageScore {
  lexical_score: number;
  is_suspicious: boolean;
  triage_reason: string;
  feature_attributions: Record<string, number>;
}

export interface DNSRecords {
  a_records: string[];
  aaaa_records: string[];
  mx_records: string[];
  ns_records: string[];
  txt_records: string[];
  ttl_average?: number;
}

export interface DomainIntel {
  registrable_domain: string;
  subdomain?: string;
  tld: string;
  domain_age_days?: number;
  is_newly_registered: boolean;
  registrar?: string;
  creation_date?: string;
  dns: DNSRecords;
  tls_valid?: boolean;
  tls_issuer?: string;
  tls_days_remaining?: number;
  tls_is_self_signed: boolean;
  ip_geolocation?: {
    country?: string;
    asn?: string;
    city?: string;
  };
}

export interface FormDetail {
  action: string;
  method: string;
  input_types: string[];
  has_password: boolean;
  has_credit_card: boolean;
  is_cross_origin: boolean;
}

export interface CrawlArtifacts {
  final_url: string;
  status_code: number;
  redirect_chain: string[];
  title?: string;
  dom_text_snippet?: string;
  forms: FormDetail[];
  has_password_field: boolean;
  has_obfuscated_js: boolean;
  external_resource_count: number;
  external_domains: string[];
  screenshot_url?: string;
  screenshot_hash?: string;
  crawl_time_ms: number;
  error_message?: string;
}

export interface BrandMatch {
  matched_brand?: string;
  brand_display_name?: string;
  brand_official_domain?: string;
  brand_logo_url?: string;
  visual_similarity: number;
  text_cue_similarity: number;
  combined_brand_confidence: number;
  is_contradiction: boolean;
  contradiction_explanation?: string;
}

export interface AttackChainNode {
  id: string;
  step_number: number;
  category: 'ingress' | 'resolution' | 'redirect' | 'landing' | 'form_hook' | 'exfiltration' | 'verdict';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'safe';
  metadata: Record<string, any>;
}

export interface EvidenceItem {
  category: string;
  name: string;
  weight: number;
  contribution: number;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
}

export interface HeaderAuditItem {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  value?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  exploit_risk: string;
  remediation: string;
}

export interface SecurityPostureAudit {
  security_grade: string;
  score_percentage: number;
  is_clickjackable: boolean;
  is_email_spoofable: boolean;
  has_hsts: boolean;
  has_csp: boolean;
  findings: HeaderAuditItem[];
  hacker_perspective_summary: string;
  key_vulnerabilities: string[];
  remediation_steps: string[];
}

export interface GeminiAIInsight {
  threat_intel_analysis: string;
  hacker_perspective_audit: string;
  remediation_recommendations: string[];
}

export interface RiskScoreReport {
  case_id: string;
  target_url: string;
  canonical_domain: string;
  timestamp: string;
  overall_risk_score: number;
  verdict: 'PHISHING' | 'SUSPICIOUS' | 'BENIGN' | 'UNKNOWN';
  confidence: number;
  recommended_action: string;
  score_lexical: number;
  score_infrastructure: number;
  score_content_behavior: number;
  score_visual_brand: number;
  score_reputation: number;
  brand_analysis: BrandMatch;
  attack_chain: AttackChainNode[];
  evidence_breakdown: EvidenceItem[];
  triage: TriageScore;
  domain_intel: DomainIntel;
  crawl_artifacts?: CrawlArtifacts;
  security_audit?: SecurityPostureAudit;
  ai_insights?: GeminiAIInsight;
}

export interface CaseSummary {
  case_id: string;
  target_url: string;
  canonical_domain: string;
  risk_score: number;
  verdict: string;
  matched_brand?: string;
  is_contradiction: boolean;
  created_at: string;
  analyst_verdict?: string;
  analyst_notes?: string;
}

export interface FeedItem {
  id: string;
  domain: string;
  discovered_time: string;
  source: string;
  fast_risk_score: number;
  is_escalated: boolean;
  status: 'queued' | 'triaged' | 'deep_analyzed' | 'ignored';
  tags: string[];
}

export interface BenchmarkSample {
  id: string;
  name: string;
  url: string;
  category: string;
  expected_brand?: string;
  description: string;
}
