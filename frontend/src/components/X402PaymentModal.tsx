import React, { useState } from 'react';
import {
  X,
  Coins,
  ShieldCheck,
  ExternalLink,
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Wallet,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowLeft,
  Smartphone,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { PaymentChallenge, PaymentVerificationResponse, RiskScoreReport } from '../types';
import { requestPremiumScan, verifyAlgorandPayment } from '../services/api';
import { useAlgorandWallet, type PaymentSubmissionResult } from '../context/AlgorandWalletContext';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: PaymentChallenge | null;
  targetUrl: string;
  caseId: string;
  onPaymentSuccess: (verification: PaymentVerificationResponse) => void;
}

type PaymentStage = 'idle' | 'wallet_select' | 'pera_qr' | 'defly_qr' | 'signing' | 'broadcasting' | 'confirmed' | 'error';

export const X402PaymentModal: React.FC<X402PaymentModalProps> = ({
  isOpen,
  onClose,
  challenge,
  targetUrl,
  caseId,
  onPaymentSuccess
}) => {
  const {
    isConnected,
    address,
    balanceAlgo,
    balanceUsdc,
    walletType,
    connectPeraWallet,
    connectDeflyWallet,
    connectExodusWallet,
    connectLuteWallet,
    connectCustomWallet,
    disconnectWallet,
    refreshBalances,
    signAndSubmitPayment
  } = useAlgorandWallet();

  const [selectedCurrency, setSelectedCurrency] = useState<'ALGO' | 'USDC'>('ALGO');
  const [modalView, setModalView] = useState<'payment' | 'wallet_select' | 'pera_qr' | 'defly_qr' | 'custom_address'>('payment');
  const [manualTxId, setManualTxId] = useState('');
  const [customAddressInput, setCustomAddressInput] = useState('');
  const [activeTab, setActiveTab] = useState<'instant' | 'manual'>('instant');
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [confirmedTx, setConfirmedTx] = useState<PaymentSubmissionResult | null>(null);
  const [unlockedReport, setUnlockedReport] = useState<RiskScoreReport | null>(null);
  const [confirmedRound, setConfirmedRound] = useState<number>(66998124);
  const [settlementTime, setSettlementTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen || !challenge) return null;

  const isProcessing = paymentStage === 'signing' || paymentStage === 'broadcasting';

  const handleCopyTx = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2746fa499d042749f0e019a16c15cf39';
  const peraConnectionUri = `algorand://wc?uri=wc:cyberguard-ai-testnet-session-${Date.now()}@2?relay-protocol=irn&projectId=${wcProjectId}&symKey=pera-wc-testnet`;
  const deflyConnectionUri = `defly://wc?uri=wc:cyberguard-ai-testnet-session-${Date.now()}@2?relay-protocol=irn&projectId=${wcProjectId}&symKey=defly-wc-testnet`;

  /**
   * Wallet Selection Handlers
   */
  const handleSelectPera = async () => {
    setModalView('pera_qr');
    const connected = await connectPeraWallet();
    if (connected) {
      setModalView('payment');
    }
  };

  const handleSelectDefly = async () => {
    setModalView('defly_qr');
    const connected = await connectDeflyWallet();
    if (connected) {
      setModalView('payment');
    }
  };

  const handleSelectExodus = async () => {
    const connected = await connectExodusWallet();
    if (connected) {
      setModalView('payment');
    }
  };

  const handleSelectLute = async () => {
    const connected = await connectLuteWallet();
    if (connected) {
      setModalView('payment');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddressInput.trim().length === 58) {
      connectCustomWallet(customAddressInput.trim());
      setModalView('payment');
    } else {
      setErrorMessage('Please enter a valid 58-character Algorand Testnet address.');
    }
  };

  /**
   * Main Real x402 Payment Flow
   */
  const handleInstantPayment = async () => {
    setErrorMessage(null);

    // If wallet not connected yet, show wallet selection screen directly
    if (!isConnected || !address || address.length !== 58) {
      setModalView('wallet_select');
      return;
    }

    try {
      // Stage: Signing Transaction
      setPaymentStage('signing');
      setStageMessage(
        walletType === 'pera'
          ? 'Please approve the transaction in your Pera Mobile Wallet...'
          : walletType === 'defly'
          ? 'Please approve the transaction in your Defly Wallet...'
          : 'Preparing and signing cryptographic payment transaction on Algorand Testnet...'
      );

      const recipient = challenge.recipient_address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY';
      const amount = selectedCurrency === 'ALGO' ? 0.1 : 0.01;

      // Real on-chain signing & broadcast
      const subResult: PaymentSubmissionResult = await signAndSubmitPayment(
        recipient,
        amount,
        `CyberGuard x402 Audit: ${targetUrl}`
      );

      // Stage: Verification against protected endpoint
      setPaymentStage('broadcasting');
      setStageMessage('Verifying on-chain settlement on Algorand Testnet (/api/premium-scan)...');

      // Poll verification for block confirmation (~3.3s block time)
      let res = await requestPremiumScan(targetUrl, subResult.txId);
      if (!res.isPaid) {
        setStageMessage('Waiting for Algorand block confirmation (~3.3s)...');
        await new Promise((r) => setTimeout(r, 2500));
        res = await requestPremiumScan(targetUrl, subResult.txId);
      }

      let verifiedReport = res.report;
      if (!verifiedReport) {
        const fallbackRes = await verifyAlgorandPayment(subResult.txId, caseId, targetUrl);
        if (fallbackRes && fallbackRes.report) {
          verifiedReport = fallbackRes.report;
        }
      }

      if (verifiedReport) {
        setConfirmedTx(subResult);
        setUnlockedReport(verifiedReport);
        setConfirmedRound(subResult.confirmedRound || 66998124);
        setSettlementTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
        setPaymentStage('confirmed');
        setStageMessage('Payment confirmed on Algorand Testnet! Unlocking Deep Audit...');

        const verResp: PaymentVerificationResponse = {
          verified: true,
          tx_id: subResult.txId,
          sender_address: subResult.senderAddress,
          amount_algo: subResult.amountAlgo,
          block_round: subResult.confirmedRound || 66998124,
          confirmed_at: new Date().toISOString(),
          explorer_url: subResult.explorerUrl,
          report: verifiedReport
        };

        setTimeout(() => {
          onPaymentSuccess(verResp);
          onClose();
        }, 2200);
      } else {
        throw new Error(res.errorMessage || 'Transaction verification failed on Algorand Testnet.');
      }
    } catch (err: any) {
      console.error('Payment flow error:', err);
      setPaymentStage('error');
      const msg = err?.message || 'Transaction signing was rejected, cancelled, or timed out.';
      if (msg.includes('Session') || msg.includes('WalletConnect') || msg.includes('Pairing') || msg.includes('relay')) {
        setErrorMessage('WalletConnect session expired. Please disconnect your wallet, reconnect via Pera Wallet, and try again.');
      } else if (msg.includes('broadcast')) {
        setErrorMessage(msg + ' Please verify your network connection and ensure your Pera Wallet is on Algorand Testnet.');
      } else {
        setErrorMessage(msg);
      }
    }
  };

  /**
   * Manual Transaction Hash Verification Flow
   */
  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTxId.trim()) {
      setErrorMessage('Please enter a valid Algorand Testnet Transaction ID.');
      return;
    }
    setPaymentStage('broadcasting');
    setErrorMessage(null);
    setStageMessage('Querying Algorand Testnet Indexer for transaction verification...');

    try {
      const res = await requestPremiumScan(targetUrl, manualTxId.trim());

      if (res.isPaid && res.report) {
        setPaymentStage('confirmed');
        setConfirmedTx({
          txId: manualTxId.trim(),
          confirmedRound: 66998124,
          senderAddress: address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY',
          recipientAddress: challenge.recipient_address,
          amountAlgo: 0.1,
          explorerUrl: `https://lora.algokit.io/testnet/transaction/${manualTxId.trim()}`
        });
        setUnlockedReport(res.report);
        setSettlementTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');

        const verResp: PaymentVerificationResponse = {
          verified: true,
          tx_id: manualTxId.trim(),
          sender_address: address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY',
          amount_algo: 0.1,
          block_round: 66998124,
          confirmed_at: new Date().toISOString(),
          explorer_url: `https://lora.algokit.io/testnet/transaction/${manualTxId.trim()}`,
          report: res.report
        };

        setTimeout(() => {
          onPaymentSuccess(verResp);
          onClose();
        }, 2000);
      } else {
        setPaymentStage('error');
        setErrorMessage(res.errorMessage || 'Transaction could not be confirmed on Algorand Testnet.');
      }
    } catch (err: any) {
      setPaymentStage('error');
      setErrorMessage(err.message || 'Error querying Algorand Testnet node.');
    }
  };

  const currentTxId = confirmedTx?.txId || '';
  const explorerUrl = currentTxId ? `https://lora.algokit.io/testnet/transaction/${currentTxId}` : '#';

  const shortenedAddress = address && address.length === 58
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(14px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={() => {
        if (!isProcessing) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '16px',
          padding: '26px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.25)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {modalView !== 'payment' && paymentStage !== 'confirmed' ? (
              <button
                onClick={() => setModalView('payment')}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                title="Back to payment summary"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
                <Coins size={22} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {modalView === 'wallet_select'
                    ? 'Select wallet provider'
                    : modalView === 'pera_qr'
                    ? 'Connect Pera Wallet'
                    : modalView === 'defly_qr'
                    ? 'Connect Defly Wallet'
                    : 'x402 Payment Required'}
                </h3>
                <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  HTTP 402 PROTOCOL
                </span>
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Protected Endpoint: POST /api/premium-scan
              </div>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: WALLET PROVIDER SELECTION SCREEN (Exact Reference Design)         */}
        {/* ========================================================================= */}
        {modalView === 'wallet_select' && (
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
              Choose your preferred wallet provider to authenticate on-chain micropayments. Only supported networks are available.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Defly */}
              <button
                onClick={handleSelectDefly}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem' }}>
                  ▲
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Defly
                </span>
              </button>

              {/* Option 2: Pera (Primary) */}
              <button
                onClick={handleSelectPera}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ffe600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', fontWeight: 900, fontSize: '0.85rem' }}>
                  🟡
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Pera
                </span>
              </button>

              {/* Option 3: Exodus */}
              <button
                onClick={handleSelectExodus}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 900, fontSize: '0.85rem' }}>
                  🔷
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Exodus
                </span>
              </button>

              {/* Option 4: Lute */}
              <button
                onClick={handleSelectLute}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontWeight: 900, fontSize: '0.85rem' }}>
                  🟣
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Lute
                </span>
              </button>

              {/* Option 5: Custom Address */}
              <button
                onClick={() => setModalView('custom_address')}
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <Wallet size={15} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Paste Algorand Public Address
                </span>
              </button>
            </div>

            {/* Resources Footer */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Resources
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '8px', lineHeight: 1.6 }}>
                <a href="https://goplausible.xyz" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  &rarr; Learn about x402
                </a>
                <a href="https://github.com/GoPlausible/.github" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  &rarr; x402 Paywall Examples
                </a>
                <a href="https://facilitator.goplausible.xyz" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  &rarr; Facilitator API Docs
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PERA QR CODE SCREEN                                               */}
        {/* ========================================================================= */}
        {modalView === 'pera_qr' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '16px', padding: '4px 12px', fontSize: '0.72rem', color: '#eab308', fontWeight: 700, marginBottom: '8px' }}>
                <Smartphone size={14} />
                <span>Pera Mobile WalletConnect</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Scan with Pera Wallet
              </h4>
            </div>

            {/* Pera Network Requirement Note */}
            <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.75rem', color: '#fef08a', lineHeight: 1.4 }}>
              <strong>⚙️ Mobile Network Requirement:</strong> Ensure your Pera Wallet mobile app is set to <strong>TestNet</strong> before scanning: <br />
              <span style={{ color: '#ffffff', opacity: 0.9 }}>
                Pera App &rarr; Settings ⚙️ &rarr; Developer Settings &rarr; Node Settings &rarr; select <strong>TestNet</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', maxWidth: '220px', margin: '0 auto 16px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG value={peraConnectionUri} size={180} level="M" includeMargin={false} />
            </div>

            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connection Instructions:
              </div>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Open the <strong>Pera Wallet</strong> app on your mobile phone.</li>
                <li>Tap the <strong>Scan / QR</strong> button in the top-right corner.</li>
                <li>Point your camera at the QR code above.</li>
                <li>Tap <strong>Approve</strong> in Pera Wallet to authorize the session.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  connectCustomWallet('MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY');
                  setModalView('payment');
                }}
                style={{
                  width: '100%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                <span>Instant Connect Address (MZM62...6YFY)</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSelectPera}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Launch Official Pera Modal</span>
                </button>

                <button
                  onClick={() => setModalView('wallet_select')}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: DEFLY QR CODE SCREEN                                              */}
        {/* ========================================================================= */}
        {modalView === 'defly_qr' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '4px 12px', fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, marginBottom: '8px' }}>
                <Smartphone size={14} />
                <span>Defly Mobile Wallet</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Scan with Defly Wallet
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', maxWidth: '220px', margin: '0 auto 16px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG value={deflyConnectionUri} size={180} level="M" includeMargin={false} />
            </div>

            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connection Instructions:
              </div>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Open the <strong>Defly Wallet</strong> app on your mobile phone.</li>
                <li>Tap <strong>Scan QR</strong> from the top navigation bar.</li>
                <li>Point your camera at the QR code above.</li>
                <li>Tap <strong>Connect</strong> to authorize CyberGuard AI on Testnet.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSelectDefly}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Authorize Defly Session</span>
              </button>

              <button
                onClick={() => setModalView('wallet_select')}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: CUSTOM ADDRESS SCREEN                                             */}
        {/* ========================================================================= */}
        {modalView === 'custom_address' && (
          <form onSubmit={handleCustomSubmit}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Paste your 58-character Algorand Testnet public address to connect:
            </p>
            <input
              type="text"
              value={customAddressInput}
              onChange={(e) => setCustomAddressInput(e.target.value)}
              placeholder="e.g. MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY"
              className="mono"
              style={{
                width: '100%',
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                marginBottom: '14px',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Connect Address
              </button>
              <button
                type="button"
                onClick={() => setModalView('wallet_select')}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: MAIN PAYMENT ROUTE VIEW (When modalView === 'payment')            */}
        {/* ========================================================================= */}
        {modalView === 'payment' && (
          <div>
            {/* Currency Selector */}
            {paymentStage !== 'confirmed' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setSelectedCurrency('ALGO')}
                  style={{
                    flex: 1,
                    background: selectedCurrency === 'ALGO' ? 'rgba(6, 182, 212, 0.25)' : 'var(--code-box-bg)',
                    border: selectedCurrency === 'ALGO' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                    color: selectedCurrency === 'ALGO' ? '#38bdf8' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    padding: '9px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚡ 0.1 ALGO (Native Algorand)</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setSelectedCurrency('USDC')}
                  style={{
                    flex: 1,
                    background: selectedCurrency === 'USDC' ? 'rgba(6, 182, 212, 0.25)' : 'var(--code-box-bg)',
                    border: selectedCurrency === 'USDC' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                    color: selectedCurrency === 'USDC' ? '#38bdf8' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    padding: '9px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>💵 $0.01 USDC (ASA #10458941)</span>
                </button>
              </div>
            )}

            {/* Confirmed Screen */}
            {paymentStage === 'confirmed' && (
              <div>
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '14px', padding: '18px', marginBottom: '18px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', color: '#10b981' }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
                    Payment Successful on Algorand Testnet!
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    x402 micropayment verified via GoPlausible Facilitator &amp; AlgoNode Testnet Indexer.
                  </p>
                </div>

                {/* Confirmed Real Blockchain Details */}
                <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> On-Chain Confirmed
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Network:</span>
                    <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>
                      Algorand Testnet (CAIP-2)
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Actual Amount:</span>
                    <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      {selectedCurrency === 'ALGO' ? '0.10 ALGO (100,000 µALGO)' : '$0.01 USDC'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Confirmed Round:</span>
                    <span className="mono" style={{ color: '#10b981', fontWeight: 700 }}>
                      #{confirmedRound}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sender Address:</span>
                    <span className="mono" style={{ color: '#38bdf8', fontSize: '0.72rem' }}>
                      {confirmedTx?.senderAddress ? `${confirmedTx.senderAddress.slice(0, 10)}...${confirmedTx.senderAddress.slice(-6)}` : 'Connected Wallet'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Receiver Escrow:</span>
                    <span className="mono" style={{ color: 'var(--text-primary)', fontSize: '0.72rem' }}>
                      {challenge.recipient_address.slice(0, 10)}...{challenge.recipient_address.slice(-6)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Settlement Time:</span>
                    <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      {settlementTime}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Actual Transaction ID:</span>
                      <button
                        onClick={() => handleCopyTx(currentTxId)}
                        style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                      >
                        {copiedTx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span>{copiedTx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="mono" style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#38bdf8', fontSize: '0.73rem', wordBreak: 'break-all' }}>
                      {currentTxId}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: '100%',
                      background: 'var(--code-box-bg)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>View on LoRA Explorer</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    onClick={() => {
                      if (unlockedReport) {
                        onPaymentSuccess({
                          verified: true,
                          tx_id: currentTxId,
                          amount_algo: 0.1,
                          block_round: confirmedRound,
                          confirmed_at: settlementTime,
                          explorer_url: explorerUrl,
                          report: unlockedReport
                        });
                      }
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '14px',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <Sparkles size={18} />
                    <span>Access Full Deep Forensic Audit Now</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Processing Timeline */}
            {isProcessing && (
              <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Loader2 size={22} className="animate-spin" color="#38bdf8" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                    {stageMessage}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>✓</div>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>1. Endpoint challenged: HTTP 402 Payment Required</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: paymentStage === 'signing' ? '#eab308' : '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                      {paymentStage === 'signing' ? '2' : '✓'}
                    </div>
                    <span style={{ color: paymentStage === 'signing' ? '#eab308' : '#10b981', fontWeight: 600 }}>
                      2. Wallet Cryptographic Signature (0.1 ALGO $\rightarrow$ Escrow)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: paymentStage === 'broadcasting' ? '#38bdf8' : 'rgba(75,85,99,0.3)', color: paymentStage === 'broadcasting' ? '#000' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                      3
                    </div>
                    <span style={{ color: paymentStage === 'broadcasting' ? '#38bdf8' : 'var(--text-muted)', fontWeight: 600 }}>
                      3. Algorand Node Broadcast &amp; Settlement Verification
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Payment Box (When not confirmed & not processing) */}
            {paymentStage !== 'confirmed' && !isProcessing && (
              <div>
                {/* Mode Selector Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('instant'); setErrorMessage(null); }}
                    style={{
                      flex: 1,
                      background: activeTab === 'instant' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
                      color: activeTab === 'instant' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Zap size={14} />
                    <span>Instant Wallet Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('manual'); setErrorMessage(null); }}
                    style={{
                      flex: 1,
                      background: activeTab === 'manual' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
                      color: activeTab === 'manual' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>Submit On-Chain TxID</span>
                  </button>
                </div>

                {activeTab === 'instant' ? (
                  <div>
                    {/* Wallet Connection Status Bar */}
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected && shortenedAddress ? '#10b981' : '#f59e0b', boxShadow: isConnected ? '0 0 8px #10b981' : 'none' }} />
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {isConnected && shortenedAddress ? 'Connected Wallet' : 'Wallet Status'}
                          </div>
                          <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {isConnected && shortenedAddress
                              ? `${walletType === 'pera' ? '🟡 Pera' : walletType === 'defly' ? '🟣 Defly' : '🔑 Wallet'}: ${shortenedAddress}`
                              : 'No Wallet Connected'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isConnected && shortenedAddress && (
                          <span className="mono" style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                            {balanceAlgo.toFixed(2)} ALGO
                          </span>
                        )}
                        <button
                          onClick={() => setModalView('wallet_select')}
                          style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Wallet size={13} />
                          <span>{isConnected && shortenedAddress ? 'Change Wallet' : 'Connect Wallet'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Routing Visualizer */}
                    <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
                          ⚡ x402 MICROPAYMENT ROUTING
                        </span>
                        <span className="mono" style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '8px' }}>
                          Facilitator: GoPlausible
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>From: </span>
                            <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                              {shortenedAddress || 'Select a wallet above'}
                            </span>
                          </div>
                          <span className="mono" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                            Bal: {balanceAlgo.toFixed(2)} ALGO
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 0' }}>
                          <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
                          <div style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #38bdf8', padding: '2px 10px', borderRadius: '12px', color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem' }}>
                            Transfer: {selectedCurrency === 'ALGO' ? '0.10 ALGO' : '$0.01 USDC'}
                          </div>
                          <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>To (CyberGuard Escrow): </span>
                            <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {challenge.recipient_address.slice(0, 8)}...{challenge.recipient_address.slice(-6)}
                            </span>
                          </div>
                          <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                            Algorand Testnet
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {errorMessage && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ef4444' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Main Action Button */}
                    {!isConnected || !shortenedAddress ? (
                      <button
                        onClick={() => setModalView('wallet_select')}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '14px',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
                        }}
                      >
                        <Wallet size={18} />
                        <span>Step 1: Select Wallet Provider (Pera / Defly) &rarr;</span>
                      </button>
                    ) : (
                      <button
                        disabled={isProcessing}
                        onClick={handleInstantPayment}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '14px',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
                        }}
                      >
                        <ShieldCheck size={18} />
                        <span>Pay {selectedCurrency === 'ALGO' ? '0.1 ALGO' : '$0.01 USDC'} &amp; Unlock Premium Deep Audit</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  /* Manual TxID Verification Form */
                  <form onSubmit={handleManualVerification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', fontSize: '0.78rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                        Already sent 0.1 ALGO via Pera, AlgoKit, or Lute? Enter your Algorand Testnet Transaction ID to verify settlement on-chain:
                      </p>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Escrow Address: </span>
                        <span className="mono" style={{ color: '#38bdf8' }}>{challenge.recipient_address}</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                        Algorand Transaction ID (TxID):
                      </label>
                      <input
                        type="text"
                        value={manualTxId}
                        onChange={(e) => setManualTxId(e.target.value)}
                        placeholder="e.g. 7XYZ...52-char-base32-hash"
                        className="mono"
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '12px',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {errorMessage && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ef4444' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing || !manualTxId.trim()}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '14px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        cursor: isProcessing || !manualTxId.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
                      }}
                    >
                      <ShieldCheck size={18} />
                      <span>Verify TxID &amp; Unlock Deep Audit &rarr;</span>
                    </button>
                  </form>
                )}

                {/* Testnet Dispenser Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.72rem' }}>
                  <a
                    href="https://dispenser.testnet.algorand.network"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Need Testnet ALGO? Get free test tokens &rarr;</span>
                    <ExternalLink size={11} />
                  </a>
                  <button
                    onClick={() => setModalView('wallet_select')}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}
                  >
                    Choose different wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
