'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // We need a library to decode the JWT

// Define the shape of the decoded JWT payload
interface DecodedToken {
  payload: {
    id: number;
    name: string;
    email: string;
  };
  exp: number;
}

// Define the shape of our user object
interface User {
  id: number;
  name: string;
  email: string;
}

// Define the shape of our AuthContext
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- The Provider Component ---
// This component will wrap our entire application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check for existing session

  useEffect(() => {
    // This effect runs once when the app loads to check for a persisted session
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Check if the token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded.payload);
          setAccessToken(token);
        } else {
          // Token is expired, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error("Failed to decode token on load", error);
        // Clear stored tokens if they are invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []); // Empty array means run only once on mount

  const login = (newAccessToken: string, newRefreshToken: string) => {
    try {
        const decoded = jwtDecode<DecodedToken>(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setAccessToken(newAccessToken);
        setUser(decoded.payload);
    } catch (error) {
        console.error("Failed to decode token on login", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };
  
  const value = {
    user,
    accessToken,
    isAuthenticated: !!user, // Double-bang converts user object to boolean
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// --- The Custom Hook ---
// This is a helper hook to easily access the context from any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
