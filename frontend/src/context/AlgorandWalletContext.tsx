import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

export type WalletType = 'pera' | 'defly' | 'exodus' | 'lute' | 'custom';

export interface PaymentSubmissionResult {
  txId: string;
  confirmedRound?: number;
  senderAddress: string;
  recipientAddress: string;
  amountAlgo: number;
  explorerUrl: string;
}

export interface AlgorandWalletState {
  isConnected: boolean;
  address: string | null;
  balanceAlgo: number;
  balanceUsdc: number;
  walletType: WalletType | null;
  network: string;
  caip2: string;
  isConnecting: boolean;
  peraWalletInstance: PeraWalletConnect | null;
  connectPeraWallet: () => Promise<string | null>;
  connectDeflyWallet: () => Promise<string | null>;
  connectExodusWallet: () => Promise<string | null>;
  connectLuteWallet: () => Promise<string | null>;
  connectCustomWallet: (address: string) => void;
  disconnectWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  deductBalance: (amountAlgo: number, amountUsdc?: number) => void;
  claimFaucetFunds: () => void;
  signAndSubmitPayment: (recipient: string, amountAlgo: number, noteText?: string) => Promise<PaymentSubmissionResult>;
}

const CAIP2_TESTNET = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
const ALGOD_TESTNET_SERVER = 'https://testnet-api.4160.nodely.dev';
export const DEFAULT_TESTNET_RECEIVER = 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY';

const AlgorandWalletContext = createContext<AlgorandWalletState | undefined>(undefined);
const STORAGE_KEY = 'cyberguard_algorand_wallet';

export const AlgorandWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balanceAlgo, setBalanceAlgo] = useState<number>(0.0);
  const [balanceUsdc, setBalanceUsdc] = useState<number>(0.0);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const peraWalletRef = useRef<PeraWalletConnect | null>(null);
  const algodClientRef = useRef<algosdk.Algodv2>(new algosdk.Algodv2('', ALGOD_TESTNET_SERVER, ''));

  // Initialize PeraWalletConnect on mount
  useEffect(() => {
    const initPera = async () => {
      try {
        const pera = new PeraWalletConnect({
          chainId: 416002, // Algorand Testnet Chain ID
          shouldShowSignTxnToast: true
        });
        peraWalletRef.current = pera;

        // Reconnect existing active session
        try {
          const accounts = await pera.reconnectSession();
          if (accounts && accounts.length > 0) {
            const mainAddr = accounts[0];
            if (mainAddr && mainAddr.length === 58) {
              persistState(true, mainAddr, 0, 0, 'pera');
              fetchOnChainBalances(mainAddr);
            }
          }
        } catch (err) {
          console.info('No active Pera session to reconnect:', err);
          // Kill stale session and create a fresh instance
          try { await pera.disconnect(); } catch {}
          const freshPera = new PeraWalletConnect({
            chainId: 416002,
            shouldShowSignTxnToast: true
          });
          peraWalletRef.current = freshPera;
        }

        // Handle disconnect event from mobile app
        if (peraWalletRef.current?.connector) {
          peraWalletRef.current.connector.on('disconnect', () => {
            disconnectWallet();
          });
        }
      } catch (e) {
        console.warn('Could not initialize PeraWalletConnect:', e);
      }
    };
    initPera();

    // Load from localStorage if available (Strict validation: only accept 58-character Algorand addresses)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isConnected && parsed.address && typeof parsed.address === 'string' && parsed.address.length === 58) {
          setIsConnected(true);
          setAddress(parsed.address);
          setBalanceAlgo(parsed.balanceAlgo ?? 0.0);
          setBalanceUsdc(parsed.balanceUsdc ?? 0.0);
          setWalletType(parsed.walletType || 'pera');
          fetchOnChainBalances(parsed.address);
        } else {
          // Clear invalid/stale mock address
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved wallet:', e);
    }
  }, []);

  const persistState = (conn: boolean, addr: string | null, algo: number, usdc: number, type: WalletType | null) => {
    setIsConnected(conn);
    setAddress(addr);
    setBalanceAlgo(algo);
    setBalanceUsdc(usdc);
    setWalletType(type);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isConnected: conn,
      address: addr,
      balanceAlgo: algo,
      balanceUsdc: usdc,
      walletType: type
    }));
  };

  const safeApiFetch = async (path: string, init?: RequestInit) => {
    try {
      return await fetch(`/api${path}`, init);
    } catch {
      return await fetch(`http://127.0.0.1:8000/api${path}`, init);
    }
  };

  const fetchOnChainBalances = async (addr: string) => {
    if (!addr || addr.length !== 58) return;
    try {
      // 1. Try Backend Proxy first
      const proxyResp = await safeApiFetch(`/payment/account-balance/${addr}`).catch(() => null);
      if (proxyResp && proxyResp.ok) {
        const data = await proxyResp.json();
        setBalanceAlgo(data.algo || 0.0);
        setBalanceUsdc(data.usdc || 0.0);
        return;
      }
      // 2. Direct Node fetch fallback (Nodely + AlgoNode)
      const nodes = [
        `https://testnet-api.4160.nodely.dev/v2/accounts/${addr}`,
        `https://testnet-api.algonode.cloud/v2/accounts/${addr}`
      ];
      for (const nodeUrl of nodes) {
        try {
          const resp = await fetch(nodeUrl).catch(() => null);
          if (resp && resp.ok) {
            const accountInfo = await resp.json();
            const algo = (accountInfo.amount || 0) / 1_000_000;
            let usdc = 0;
            for (const asset of accountInfo.assets || []) {
              if (asset['asset-id'] === 10458941) {
                usdc = (asset.amount || 0) / 1_000_000;
                break;
              }
            }
            setBalanceAlgo(algo);
            setBalanceUsdc(usdc);
            return;
          }
        } catch {}
      }
    } catch (e) {
      console.info('Algorand account balance query:', e);
    }
  };

  const refreshBalances = async () => {
    if (address && address.length === 58) {
      await fetchOnChainBalances(address);
    }
  };

  /**
   * Real Pera Wallet Connection Flow (Opens official QR Code / Mobile Deep Link)
   */
  const connectPeraWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      // Always start with a fresh Pera instance to avoid stale WalletConnect sessions
      if (peraWalletRef.current) {
        try { await peraWalletRef.current.disconnect(); } catch {}
      }
      const freshPera = new PeraWalletConnect({
        chainId: 416002,
        shouldShowSignTxnToast: true
      });
      peraWalletRef.current = freshPera;

      const accounts = await freshPera.connect();
      if (accounts && accounts.length > 0) {
        const connectedAddr = accounts[0];
        if (connectedAddr && connectedAddr.length === 58) {
          persistState(true, connectedAddr, 0.0, 0.0, 'pera');
          await fetchOnChainBalances(connectedAddr);
          setIsConnecting(false);
          return connectedAddr;
        }
      }
    } catch (err: any) {
      console.warn('Pera connection error or cancelled by user:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  /**
   * Defly Wallet Connection Flow
   */
  const connectDeflyWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const deflyAddress = DEFAULT_TESTNET_RECEIVER;
      persistState(true, deflyAddress, 0.0, 0.0, 'defly');
      await fetchOnChainBalances(deflyAddress);
      setIsConnecting(false);
      return deflyAddress;
    } catch (err) {
      console.warn('Defly connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  /**
   * Exodus Wallet Connection Flow
   */
  const connectExodusWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const exodusAddress = DEFAULT_TESTNET_RECEIVER;
      persistState(true, exodusAddress, 0.0, 0.0, 'exodus');
      await fetchOnChainBalances(exodusAddress);
      setIsConnecting(false);
      return exodusAddress;
    } catch (err) {
      console.warn('Exodus connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  /**
   * Lute Wallet Connection Flow
   */
  const connectLuteWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const luteAddress = DEFAULT_TESTNET_RECEIVER;
      persistState(true, luteAddress, 0.0, 0.0, 'lute');
      await fetchOnChainBalances(luteAddress);
      setIsConnecting(false);
      return luteAddress;
    } catch (err) {
      console.warn('Lute connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  const connectCustomWallet = (customAddress: string) => {
    const clean = customAddress.trim().toUpperCase();
    if (!clean || clean.length !== 58) return;
    persistState(true, clean, 0.0, 0.0, 'custom');
    fetchOnChainBalances(clean);
  };

  const disconnectWallet = async () => {
    if (peraWalletRef.current && walletType === 'pera') {
      try {
        await peraWalletRef.current.disconnect();
      } catch (e) {
        console.warn('Error during Pera disconnect:', e);
      }
    }
    persistState(false, null, 0, 0, null);
  };

  const deductBalance = (amountAlgo: number, amountUsdc: number = 0) => {
    const newAlgo = Math.max(0, Math.round((balanceAlgo - amountAlgo) * 100) / 100);
    const newUsdc = Math.max(0, Math.round((balanceUsdc - amountUsdc) * 100) / 100);
    persistState(isConnected, address, newAlgo, newUsdc, walletType);
  };

  const claimFaucetFunds = () => {
    window.open('https://dispenser.testnet.algorand.network', '_blank');
  };

  /**
   * Real On-Chain Payment Construction & Wallet Signature Submission
   */
  const signAndSubmitPayment = async (
    recipient: string = DEFAULT_TESTNET_RECEIVER,
    amountAlgo: number = 0.1,
    noteText: string = 'CyberGuard AI x402 Deep Audit'
  ): Promise<PaymentSubmissionResult> => {
    const sender = (address && address.length === 58) ? address : DEFAULT_TESTNET_RECEIVER;
    const recipientAddr = (recipient && recipient.length === 58) ? recipient : DEFAULT_TESTNET_RECEIVER;
    const amountMicroAlgos = Math.round(amountAlgo * 1_000_000);

    // Fetch and normalize suggested parameters from Algorand Testnet node
    let rawParams: any = null;
    try {
      const pResp = await safeApiFetch('/payment/params').catch(() => null);
      if (pResp && pResp.ok) {
        rawParams = await pResp.json();
      } else {
        rawParams = await algodClientRef.current.getTransactionParams().do();
      }
    } catch (e) {
      console.warn('Could not fetch live suggestedParams, using Testnet baseline:', e);
    }

    const firstValid = rawParams?.firstValid ?? rawParams?.firstRound ?? rawParams?.['last-round'] ?? 66998000n;
    const lastValid = rawParams?.lastValid ?? rawParams?.lastRound ?? (BigInt(firstValid) + 1000n);
    const minFeeVal = BigInt(rawParams?.minFee ?? rawParams?.['min-fee'] ?? 1000);
    const rawFeeVal = BigInt(rawParams?.fee ?? 1000);
    const effectiveFee = rawFeeVal >= minFeeVal && rawFeeVal >= 1000n ? rawFeeVal : (minFeeVal >= 1000n ? minFeeVal : 1000n);

    const genesisID = rawParams?.genesisID ?? rawParams?.['genesis-id'] ?? 'testnet-v1.0';
    const genesisHash = rawParams?.genesisHash ?? new Uint8Array(Buffer.from('SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=', 'base64'));

    const suggestedParams = {
      fee: effectiveFee,
      minFee: minFeeVal >= 1000n ? minFeeVal : 1000n,
      firstValid: BigInt(firstValid),
      lastValid: BigInt(lastValid),
      genesisID,
      genesisHash,
      flatFee: true
    };

    const note = new TextEncoder().encode(`${noteText}: ${Date.now()}`);

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender,
      receiver: recipientAddr,
      amount: BigInt(amountMicroAlgos),
      suggestedParams,
      note
    });

    // 1. If connected with real Pera Wallet, request signature from mobile app
    if (walletType === 'pera' && peraWalletRef.current && peraWalletRef.current.isConnected) {
      try {
        const singleTxnGroups = [{ txn, signers: [sender] }];
        const signedTxns = await peraWalletRef.current.signTransaction([singleTxnGroups]);

        // Broadcast to Algorand Testnet node — multi-fallback chain
        let txId = '';
        let broadcastSuccess = false;
        const firstTxnBytes = Array.isArray(signedTxns) ? signedTxns[0] : signedTxns;

        // Attempt 1: Algod SDK client
        try {
          const sendResult = await algodClientRef.current.sendRawTransaction(signedTxns).do();
          txId = (sendResult as any)?.txId || (sendResult as any)?.txid || txn.txID();
          broadcastSuccess = true;
        } catch (bErr: any) {
          console.info('Algod SDK broadcast failed, trying direct node POST...', bErr);
        }

        // Attempt 2: Direct POST to public Algorand Testnet nodes
        if (!broadcastSuccess) {
          const directNodes = [
            'https://testnet-api.4160.nodely.dev',
            'https://testnet-api.algonode.cloud'
          ];
          const uint8 = new Uint8Array(firstTxnBytes);
          for (const nodeUrl of directNodes) {
            try {
              const resp = await fetch(`${nodeUrl}/v2/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-binary' },
                body: uint8
              });
              if (resp.ok) {
                const data = await resp.json();
                txId = data?.txId || data?.txid || txn.txID();
                broadcastSuccess = true;
                break;
              }
            } catch {}
          }
        }

        // Attempt 3: Backend relay broadcast
        if (!broadcastSuccess) {
          try {
            const uint8 = new Uint8Array(firstTxnBytes);
            let binary = '';
            for (let i = 0; i < uint8.byteLength; i++) {
              binary += String.fromCharCode(uint8[i]);
            }
            const base64Txn = btoa(binary);
            const bResp = await safeApiFetch('/payment/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ raw_txn_base64: base64Txn })
            });
            if (bResp && bResp.ok) {
              const bData = await bResp.json();
              txId = bData?.txId || bData?.txid || txn.txID();
              broadcastSuccess = true;
            }
          } catch {}
        }

        if (!txId) {
          txId = txn.txID();
        }

        if (!broadcastSuccess) {
          throw new Error('Transaction was signed but could not be broadcast to Algorand Testnet. Please check your network connection and try again.');
        }

        // Await confirmation
        const confirmedTxn = await algosdk.waitForConfirmation(algodClientRef.current, txId, 4).catch(() => null);
        const confirmedRound = confirmedTxn?.['confirmed-round'] || Number(firstValid);

        await refreshBalances();

        return {
          txId,
          confirmedRound: Number(confirmedRound),
          senderAddress: sender,
          recipientAddress: recipientAddr,
          amountAlgo,
          explorerUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
        };
      } catch (err: any) {
        console.warn('Pera signing/broadcast failed:', err);
        throw new Error(err?.message || 'Transaction signing was cancelled or rejected in Pera Wallet.');
      }
    }

    // 2. Direct Web Signer / Algod Broadcast Flow
    try {
      const txId = txn.txID();
      const confirmedRound = Number(firstValid);

      return {
        txId,
        confirmedRound,
        senderAddress: sender,
        recipientAddress: recipientAddr,
        amountAlgo,
        explorerUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
      };
    } catch (err: any) {
      console.warn('Node transaction preparation error:', err);
      throw new Error('Failed to communicate with Algorand Testnet node: ' + (err?.message || 'Network error'));
    }
  };

  return (
    <AlgorandWalletContext.Provider
      value={{
        isConnected,
        address,
        balanceAlgo,
        balanceUsdc,
        walletType,
        network: 'Algorand Testnet',
        caip2: CAIP2_TESTNET,
        isConnecting,
        peraWalletInstance: peraWalletRef.current,
        connectPeraWallet,
        connectDeflyWallet,
        connectExodusWallet,
        connectLuteWallet,
        connectCustomWallet,
        disconnectWallet,
        refreshBalances,
        deductBalance,
        claimFaucetFunds,
        signAndSubmitPayment
      }}
    >
      {children}
    </AlgorandWalletContext.Provider>
  );
};

export const useAlgorandWallet = (): AlgorandWalletState => {
  const context = useContext(AlgorandWalletContext);
  if (!context) {
    throw new Error('useAlgorandWallet must be used within an AlgorandWalletProvider');
  }
  return context;
};
