import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Define a type for our development user
interface DevUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for dev user first
    if (process.env.NODE_ENV === 'development') {
      const savedUser = localStorage.getItem('dev-user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as DevUser;
        // Cast to User type - this is a simplification for development
        setUser(parsedUser as unknown as User);
        setLoading(false);
        return;
      }
    }

    // If no dev user, use Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Development mode authentication functions
  const devSignUp = async (email: string, password: string) => {
    // Store user in localStorage for development
    const fakeUser: DevUser = {
      uid: 'dev-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      photoURL: null
    };
    
    localStorage.setItem('dev-user', JSON.stringify(fakeUser));
    setUser(fakeUser as unknown as User);
  };

  const devSignIn = async (email: string, password: string) => {
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem('dev-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser) as unknown as User);
    } else {
      // Create a new user if not found
      await devSignUp(email, password);
    }
  };

  const devLogout = async () => {
    localStorage.removeItem('dev-user');
    setUser(null);
  };

  // Actual authentication functions
  const signIn = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      await devSignIn(email, password);
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      await devSignUp(email, password);
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (process.env.NODE_ENV === 'development') {
      await devLogout();
      return;
    }

    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
