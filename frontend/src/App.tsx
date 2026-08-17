import { useState, useEffect } from 'react';
import { MatrixBackground } from './components/MatrixBackground';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Scanner } from './components/Scanner';
import { PipelineStepper } from './components/PipelineStepper';
import type { PipelineStep } from './components/PipelineStepper';
import { RiskSummaryCard } from './components/RiskSummaryCard';
import { BrandContradictionCard } from './components/BrandContradictionCard';
import { SecurityPostureCard } from './components/SecurityPostureCard';
import { AttackChainVisualizer } from './components/AttackChainVisualizer';
import { EvidenceTable } from './components/EvidenceTable';
import { TechnicalInspector } from './components/TechnicalInspector';
import { DiscoveryFeed } from './components/DiscoveryFeed';
import { ChromeExtensionPage } from './components/ChromeExtensionPage';
import { CaseHistory } from './components/CaseHistory';
import { ReportExportModal } from './components/ReportExportModal';
import { AboutModal } from './components/AboutModal';
import { HackerTransitionOverlay } from './components/HackerTransitionOverlay';
import { HackerScanTerminal } from './components/HackerScanTerminal';

import type {
  RiskScoreReport,
  CaseSummary,
  FeedItem,
  BenchmarkSample
} from './types';

import {
  analyzeDomain,
  fetchCases,
  fetchCaseById,
  fetchDiscoveryFeed,
  fetchBenchmarkSamples,
  submitAnalystFeedback,
  escalateCandidate
} from './services/api';

const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  { id: '1', name: 'Lexical Triage', detail: 'Calibrated Random Forest URL feature model', status: 'idle' },
  { id: '2', name: 'Domain & TLS Intel', detail: 'Asynchronous DNS, RDAP age & TLS validation', status: 'idle' },
  { id: '3', name: 'Isolated Sandbox Crawl', detail: 'Playwright headless DOM, forms & network capture', status: 'idle' },
  { id: '4', name: 'Brand Contradiction', detail: 'Visual hashing & brand authorization check', status: 'idle' },
  { id: '5', name: 'Attack Chain Reconstruct', detail: 'Timeline assembling ingress to credential hooks', status: 'idle' },
  { id: '6', name: 'Multi-Signal Fusion & Audit', detail: 'Calibrated risk scoring & exploitability audit', status: 'idle' }
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('cyberguard_theme') as 'dark' | 'light') || 'dark';
  });

  const [report, setReport] = useState<RiskScoreReport | null>(null);
  const [currentScanningUrl, setCurrentScanningUrl] = useState<string>('');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [benchmarkSamples, setBenchmarkSamples] = useState<BenchmarkSample[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransitioningToScanner, setIsTransitioningToScanner] = useState<boolean>(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(DEFAULT_PIPELINE_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('cyberguard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initial load & URL scan param detection
  useEffect(() => {
    loadInitialData();

    // Check if opened with ?scan=url
    const params = new URLSearchParams(window.location.search);
    const scanUrl = params.get('scan');
    if (scanUrl) {
      handleScan(scanUrl, true, false);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [casesData, feedData, samplesData] = await Promise.all([
        fetchCases(),
        fetchDiscoveryFeed(),
        fetchBenchmarkSamples()
      ]);
      setCases(casesData);
      setFeed(feedData);
      setBenchmarkSamples(samplesData);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  };

  const handleLaunchScanner = () => {
    setIsTransitioningToScanner(true);
  };

  const handleScan = async (url: string, deep: boolean = true, forceRefresh: boolean = false) => {
    setIsLoading(true);
    setCurrentScanningUrl(url);
    setErrorMessage(null);
    setReport(null);
    setActiveTab('scanner');

    // Animate pipeline stages
    const updatedSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'idle' }));
    setPipelineSteps(updatedSteps);

    // Stage 1: Lexical
    setCurrentStepIndex(0);
    updatedSteps[0].status = 'running';
    setPipelineSteps([...updatedSteps]);

    try {
      const timer1 = setTimeout(() => {
        updatedSteps[0].status = 'completed';
        updatedSteps[1].status = 'running';
        setCurrentStepIndex(1);
        setPipelineSteps([...updatedSteps]);
      }, 400);

      const timer2 = setTimeout(() => {
        updatedSteps[1].status = 'completed';
        updatedSteps[2].status = 'running';
        setCurrentStepIndex(2);
        setPipelineSteps([...updatedSteps]);
      }, 900);

      const timer3 = setTimeout(() => {
        updatedSteps[2].status = 'completed';
        updatedSteps[3].status = 'running';
        setCurrentStepIndex(3);
        setPipelineSteps([...updatedSteps]);
      }, 1500);

      const result = await analyzeDomain(url, deep, forceRefresh);

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      // Complete all steps
      const finalSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' }));
      setPipelineSteps(finalSteps);
      setCurrentStepIndex(6);

      setReport(result);
      loadInitialData();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during security inspection.');
      const failedSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'idle' }));
      setPipelineSteps(failedSteps);
      setCurrentStepIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = async (caseId: string) => {
    try {
      setIsLoading(true);
      const caseReport = await fetchCaseById(caseId);
      setReport(caseReport);
      setActiveTab('scanner');
      setPipelineSteps(DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' })));
      setCurrentStepIndex(6);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load case');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateFeed = async (itemId: string) => {
    try {
      setIsLoading(true);
      const res = await escalateCandidate(itemId);
      setReport(res);
      setActiveTab('scanner');
      setPipelineSteps(DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' })));
      setCurrentStepIndex(6);
      loadInitialData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Escalation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async (caseId: string, verdict: string, notes?: string) => {
    try {
      await submitAnalystFeedback(caseId, verdict, notes);
      loadInitialData();
    } catch (err: any) {
      alert('Feedback update error: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '40px', position: 'relative' }}>
      {/* Full-Screen Animated Hacker Ingress Transition */}
      {isTransitioningToScanner && (
        <HackerTransitionOverlay
          onComplete={() => {
            setIsTransitioningToScanner(false);
            setActiveTab('scanner');
          }}
        />
      )}

      {/* Hacker Cascading Matrix & Binary Rain Canvas (Adapts to Light / Dark) */}
      <MatrixBackground opacity={0.32} themeMode={theme} />

      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'scanner' && activeTab !== 'scanner') {
            handleLaunchScanner();
          } else {
            setActiveTab(tab);
          }
        }}
        caseCount={cases.length}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {/* Tab 1: Product Landing & Feature Showcase */}
        {activeTab === 'overview' && (
          <LandingPage
            onLaunchScanner={handleLaunchScanner}
            onOpenExtension={() => setActiveTab('extension')}
            onOpenDiscovery={() => setActiveTab('discovery')}
          />
        )}

        {/* Tab 2: Live Scanner & Security Audit */}
        {activeTab === 'scanner' && (
          <>
            <Scanner
              onScan={handleScan}
              isLoading={isLoading}
              benchmarkSamples={benchmarkSamples}
            />

            {/* Live Hacker Telemetry Terminal (Displays during active scanning) */}
            {isLoading && (
              <HackerScanTerminal targetUrl={currentScanningUrl} />
            )}

            {(isLoading || report) && (
              <PipelineStepper
                steps={pipelineSteps}
                currentStepIndex={currentStepIndex}
              />
            )}

            {errorMessage && (
              <div style={{
                margin: '0 24px 20px 24px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '16px 20px',
                color: 'var(--threat-critical)',
                fontSize: '0.85rem'
              }}>
                <strong>Security Audit Error:</strong> {errorMessage}
              </div>
            )}

            {report && (
              <>
                {/* 1. Risk Summary & Gauge */}
                <RiskSummaryCard
                  report={report}
                  onOpenExport={() => setShowExportModal(true)}
                />

                {/* 2. Website Security Posture & Exploitability Audit */}
                <SecurityPostureCard
                  audit={report.security_audit}
                  aiInsights={report.ai_insights}
                  domain={report.canonical_domain}
                />

                {/* 3. Brand-Domain Contradiction Card */}
                <BrandContradictionCard
                  brand={report.brand_analysis}
                  domainIntel={report.domain_intel}
                />

                {/* 4. Attack Chain Visualizer */}
                <AttackChainVisualizer
                  nodes={report.attack_chain}
                />

                {/* 5. Multi-Signal Evidence Breakdown Matrix */}
                <EvidenceTable
                  evidenceList={report.evidence_breakdown}
                />

                {/* 6. Deep Technical & Sandbox Inspector */}
                <TechnicalInspector
                  report={report}
                />
              </>
            )}
          </>
        )}

        {/* Tab 3: NRD Discovery Feed */}
        {activeTab === 'discovery' && (
          <DiscoveryFeed
            feed={feed}
            onEscalate={handleEscalateFeed}
            onSelectDomain={(domain) => handleScan(domain, true, false)}
            isLoading={isLoading}
            onRefreshFeed={loadInitialData}
          />
        )}

        {/* Tab 4: Chrome Extension Download & Guide */}
        {activeTab === 'extension' && (
          <ChromeExtensionPage />
        )}

        {/* Tab 5: Case History & Feedback Loop */}
        {activeTab === 'cases' && (
          <CaseHistory
            cases={cases}
            onSelectCase={handleSelectCase}
            onSubmitFeedback={handleSubmitFeedback}
          />
        )}
      </main>

      {/* About & Feature Guide Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Forensic Report Modal */}
      {showExportModal && report && (
        <ReportExportModal
          report={report}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
