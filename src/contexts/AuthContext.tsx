import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signOut,
  onAuthChange,
  checkIsAuthorized,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthorized: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthChange(async (firebaseUser) => {
        try {
          setUser(firebaseUser);
          if (firebaseUser?.email) {
            const authorized = await checkIsAuthorized(firebaseUser.email);
            setIsAuthorized(authorized);
          } else {
            setIsAuthorized(false);
          }
        } catch (err) {
          console.error('Auth check error:', err);
          setError(err instanceof Error ? err.message : 'Auth check failed');
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Firebase auth init error:', err);
      setError(
        typeof import.meta.env.VITE_FIREBASE_API_KEY === 'undefined'
          ? 'Firebase is not configured. Add VITE_FIREBASE_* env vars in Vercel (or .env locally).'
          : err instanceof Error ? err.message : 'Failed to initialize auth'
      );
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const logOut = async () => {
    try {
      await signOut();
      setIsAuthorized(false);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#f5f5f5',
        color: '#333',
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>App configuration error</h2>
          <p style={{ marginBottom: '1rem', lineHeight: 1.5 }}>{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            If you deployed to Vercel, add Environment Variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.) in Project → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthorized, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
