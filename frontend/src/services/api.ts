import type {
  RiskScoreReport,
  CaseSummary,
  FeedItem,
  BenchmarkSample
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function analyzeDomain(url: string, deepAnalysis: boolean = true, forceRefresh: boolean = false): Promise<RiskScoreReport> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      deep_analysis: deepAnalysis,
      force_refresh: forceRefresh
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to analyze domain' }));
    throw new Error(err.detail || 'Analysis request failed');
  }

  return response.json();
}

export async function fetchCases(): Promise<CaseSummary[]> {
  try {
    const response = await fetch(`${API_BASE}/cases`);
    if (!response.ok) return [];
    return response.json();
  } catch (err) {
    console.warn('Unable to load cases from backend, returning empty list:', err);
    return [];
  }
}

export async function fetchCaseById(caseId: string): Promise<RiskScoreReport> {
  const response = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!response.ok) throw new Error('Case not found');
  return response.json();
}

export async function submitAnalystFeedback(caseId: string, analystVerdict: string, notes?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/cases/${caseId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      case_id: caseId,
      analyst_verdict: analystVerdict,
      notes: notes || '',
      escalate_to_soc: false
    })
  });
  return response.json();
}

export async function fetchDiscoveryFeed(): Promise<FeedItem[]> {
  try {
    const response = await fetch(`${API_BASE}/feed/stream`);
    if (!response.ok) return [];
    return response.json();
  } catch (err) {
    console.warn('Unable to fetch discovery feed from backend:', err);
    return [];
  }
}

export async function escalateCandidate(itemId: string): Promise<RiskScoreReport> {
  const response = await fetch(`${API_BASE}/feed/escalate/${itemId}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Escalation failed');
  return response.json();
}

export async function fetchBenchmarkSamples(): Promise<BenchmarkSample[]> {
  try {
    const response = await fetch(`${API_BASE}/benchmark/samples`);
    if (!response.ok) return [];
    return response.json();
  } catch (err) {
    return [
      {
        id: 'sample-paypal',
        name: 'PayPal Credential Harvester Lookalike',
        url: 'http://login-paypal-security-verification.xyz/auth/signin',
        category: 'Phishing (Brand Contradiction)',
        expected_brand: 'PayPal',
        description: 'Simulated lookalike domain targeting PayPal with login inputs on an unauthorized .xyz TLD.'
      },
      {
        id: 'sample-o365',
        name: 'Microsoft 365 / OneDrive Fake Portal',
        url: 'http://microsoft-onedrive-sharepoint-verify.top/login.php',
        category: 'Phishing (Credential Phish)',
        expected_brand: 'Microsoft 365 / Outlook',
        description: 'Newly registered .top domain imitating Microsoft Office 365 sign-in.'
      },
      {
        id: 'sample-google',
        name: 'Legitimate Google Workspace Portal',
        url: 'https://accounts.google.com',
        category: 'Legitimate / Benign',
        expected_brand: 'Google Workspace / Gmail',
        description: 'Authentic Google authentication service hosted on official google.com infrastructure.'
      }
    ];
  }
}
