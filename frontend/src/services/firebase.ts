// Firebase Configuration & Service Initialization for CyberGuard AI
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  deleteDoc 
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyDe8BzB0hdpTqFMcmvF9lWjlT-WUHro2hY",
  authDomain: "cyberguard-73b2c.firebaseapp.com",
  projectId: "cyberguard-73b2c",
  storageBucket: "cyberguard-73b2c.firebasestorage.app",
  messagingSenderId: "681241500595",
  appId: "1:681241500595:web:d48079a9bbcca6480ac9c6",
  measurementId: "G-SC76M0MN9D"
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore Cloud Database for cross-device sessions
export const db = getFirestore(app);

// Initialize Analytics (guard for SSR / unsupported environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Convert Firebase User to CyberGuard UserProfile
export function mapFirebaseUser(user: FirebaseUser) {
  return {
    id: user.uid,
    username: user.displayName || user.email?.split('@')[0] || 'CyberOperator',
    email: user.email || '',
    photoURL: user.photoURL || undefined,
    created_at: user.metadata.creationTime || new Date().toISOString()
  };
}

// Google Sign-In with Popup
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(result.user);
}

// Email/Password Sign-In
export async function signInEmailPassword(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUser(result.user);
}

// Email/Password Registration
export async function registerEmailPassword(username: string, email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (username && result.user) {
    try {
      await updateProfile(result.user, { displayName: username });
    } catch (e) {
      console.warn('Could not update profile display name:', e);
    }
  }
  return mapFirebaseUser(result.user);
}

// Sign Out
export async function firebaseSignOut() {
  await fbSignOut(auth);
}

// Sync Copilot Chat Sessions to Firestore
export async function syncChatSessionsToFirestore(userId: string, sessions: any[]) {
  if (!userId || !sessions) return;
  try {
    const userDocRef = doc(db, "cyberguard_users", userId);
    await setDoc(userDocRef, {
      sessions,
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore sessions sync warning:", err);
  }
}

// Fetch Copilot Chat Sessions from Firestore
export async function fetchChatSessionsFromFirestore(userId: string): Promise<any[] | null> {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, "cyberguard_users", userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.sessions || [];
    }
  } catch (err) {
    console.warn("Firestore sessions fetch warning:", err);
  }
  return null;
}
