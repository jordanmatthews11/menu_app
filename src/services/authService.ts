import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if an email exists in the authorizedUsers Firestore collection.
 */
export async function checkIsAuthorized(email: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'authorizedUsers'),
      where('email', '==', email.toLowerCase())
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.error('Error checking authorization:', err);
    return false;
  }
}
