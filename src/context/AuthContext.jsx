import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { AuthService } from '../utils/authService';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({
   user: null, // Firebase User (only set after backend sync succeeds)
   userProfile: null, // Backend Profile (Role, Display Name, etc.)
   loading: true,
   logout: async () => {} // Logout function
});

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [userProfile, setUserProfile] = useState(null);
   const [loading, setLoading] = useState(true);

   // Track last synced user to prevent duplicate backend calls
   const lastSyncedUserId = useRef(null);

   // Logout function
   const logout = async () => {
      try {
         localStorage.removeItem('auth_token');
         await signOut(auth);
         setUser(null);
         setUserProfile(null);
         lastSyncedUserId.current = null;
      } catch (error) {
         console.error('Logout failed:', error);
      }
   };

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
         if (firebaseUser) {
            try {
               const token = await firebaseUser.getIdToken();
               localStorage.setItem('auth_token', token);

               // DEDUPLICATION: Only call backend if user ID changed
               const shouldSync = lastSyncedUserId.current !== firebaseUser.uid;

               if (shouldSync) {
                  try {
                     const response = await AuthService.backendLogin(token);
                     if (response) {
                        // SUCCESS: Both Firebase and backend succeeded
                        setUserProfile(response);
                        setUser(firebaseUser); // Only set user AFTER backend sync succeeds
                        lastSyncedUserId.current = firebaseUser.uid;
                     } else {
                        // Backend returned falsy response - treat as failure
                        throw new Error('Backend returned empty response');
                     }
                  } catch (backendError) {
                     console.error('Backend login failed, signing out:', backendError);
                     // FAIL: Sign out of Firebase since backend sync failed
                     localStorage.removeItem('auth_token');
                     await signOut(auth);
                     setUser(null);
                     setUserProfile(null);
                     lastSyncedUserId.current = null;
                  }
               } else {
                  // Already synced for this user, just update the user state
                  setUser(firebaseUser);
               }
            } catch (error) {
               console.error('Failed to get ID token:', error);
               // Token retrieval failed - sign out
               await signOut(auth);
               setUser(null);
               setUserProfile(null);
            }
         } else {
            // User logged out
            localStorage.removeItem('auth_token');
            setUser(null);
            setUserProfile(null);
            lastSyncedUserId.current = null;
         }

         setLoading(false);
      });

      return () => unsubscribe();
   }, []);

   // Cross-tab logout sync: Listen for localStorage changes from other tabs
   useEffect(() => {
      const handleStorageChange = event => {
         // If auth_token was removed in another tab, logout this tab too
         if (event.key === 'auth_token' && event.newValue === null && user) {
            console.log('Auth token removed in another tab, logging out...');
            signOut(auth);
            setUser(null);
            setUserProfile(null);
            lastSyncedUserId.current = null;
         }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
   }, [user]);

   // Check auth state when tab becomes visible (handles edge cases)
   useEffect(() => {
      const handleVisibilityChange = async () => {
         if (document.visibilityState === 'visible' && user) {
            // Check if token still exists
            const token = localStorage.getItem('auth_token');
            if (!token) {
               console.log('Auth token missing, logging out...');
               await signOut(auth);
               setUser(null);
               setUserProfile(null);
               lastSyncedUserId.current = null;
            }
         }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
   }, [user]);

   if (loading) {
      return (
         <div className="h-screen w-full bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
         </div>
      );
   }

   return <AuthContext.Provider value={{ user, userProfile, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
