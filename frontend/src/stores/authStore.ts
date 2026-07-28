import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { showToast } from '../components/ui/Toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;

  // Actions
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: (email: string, password: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string | null) => Promise<void>;
  reloadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      lastUpdated: Date.now(),

      signup: async (email, password, displayName) => {
        if (!auth) {
          showToast('error', 'Firebase not configured. Please check Vercel environment variables.');
          return;
        }
        try {
          set({ loading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName });

          // Send verification email
          await sendEmailVerification(userCredential.user);

          // Sign out immediately — user must verify before they can log in
          await signOut(auth);

          set({ user: null, loading: false });
          showToast('success', 'Account created! Please check your email to verify your account.');
        } catch (error: any) {
          set({ error: error.message, loading: false });
          showToast('error', error.message);
          throw error;
        }
      },

      login: async (email, password) => {
        if (!auth) {
          showToast('error', 'Firebase not configured. Please check Vercel environment variables.');
          return;
        }
        try {
          set({ loading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);

          // Block unverified users
          if (!userCredential.user.emailVerified) {
            await signOut(auth);
            set({ user: null, loading: false, error: 'email-not-verified' });
            showToast('error', 'Please verify your email before logging in. Check your inbox!');
            throw new Error('email-not-verified');
          }

          set({ user: userCredential.user, loading: false });
          showToast('success', 'Welcome back!');
        } catch (error: any) {
          if (error.message !== 'email-not-verified') {
            set({ error: error.message, loading: false });
            showToast('error', 'Invalid email or password');
          }
          throw error;
        }
      },

      logout: async () => {
        if (!auth) {
          set({ user: null, loading: false });
          return;
        }
        try {
          await signOut(auth);
          set({ user: null, loading: false });
          showToast('success', 'Logged out successfully');
        } catch (error: any) {
          showToast('error', 'Logout failed');
          throw error;
        }
      },

      resetPassword: async (email) => {
        if (!auth) {
          showToast('error', 'Firebase not configured.');
          return;
        }
        try {
          await sendPasswordResetEmail(auth, email);
          showToast('success', 'Password reset email sent!');
        } catch (error: any) {
          showToast('error', 'Failed to send reset email');
          throw error;
        }
      },

      resendVerification: async (email, password) => {
        if (!auth) {
          showToast('error', 'Firebase not configured.');
          return;
        }
        try {
          // Temporarily sign in to get the user object, send verification, then sign out
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
          await signOut(auth);
          showToast('success', 'Verification email sent! Check your inbox.');
        } catch (error: any) {
          showToast('error', 'Failed to send verification email. Check your credentials.');
          throw error;
        }
      },

      updateUserProfile: async (displayName, photoURL) => {
        if (!auth || !auth.currentUser) {
          showToast('error', 'User not authenticated or Firebase missing.');
          return;
        }
        try {
          // Explicitly handle removal: '' or null means set to null
          const isRemoving = photoURL === '' || photoURL === null;
          const newPhotoURL = isRemoving ? null : (photoURL || auth.currentUser.photoURL);
          const newDisplayName = displayName !== undefined ? (displayName || auth.currentUser.displayName) : auth.currentUser.displayName;

          await updateProfile(auth.currentUser, {
            displayName: newDisplayName || undefined,
            photoURL: newPhotoURL
          });

          await auth.currentUser.reload();

          const updatedUser = {
            ...auth.currentUser,
            photoURL: newPhotoURL,
            displayName: newDisplayName || auth.currentUser.displayName
          };

          set({
            user: updatedUser as User,
            lastUpdated: Date.now(),
            loading: false
          });

          showToast('success', 'Profile updated!');
        } catch (error: any) {
          showToast('error', 'Failed to update profile');
          throw error;
        }
      },

      reloadUser: async () => {
        if (auth.currentUser) {
          try {
            await auth.currentUser.reload();
            set({ user: auth.currentUser, lastUpdated: Date.now() });
          } catch (error) {
            console.error('Failed to reload user:', error);
          }
        }
      },

      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Initialize auth listener if auth is available
if (auth && typeof onAuthStateChanged === 'function') {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Always reload to get fresh verification status
      try {
        await user.reload();
      } catch (e) {
        console.error('Auth reload failed:', e);
      }
    }
    useAuthStore.getState().setUser(user);
  });
} else {
  // If no auth, set loading to false to allow app to render landing page
  useAuthStore.getState().setLoading(false);
}