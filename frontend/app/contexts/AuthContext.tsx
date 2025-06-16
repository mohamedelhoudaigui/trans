'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number; name: string; email: string; avatar: string; wins: number; loses: number;
}

interface DecodedToken {
  payload: User; iat: number; exp: number;
}

interface AuthContextType {
  user: User | null; accessToken: string | null; isAuthenticated: boolean; isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("FATAL_ERROR: NEXT_PUBLIC_API_BASE_URL is not defined in the environment.");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setAccessToken(storedToken);
          setUser(decoded.payload);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error("Auth init failed: Invalid token found in storage.", error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.result || 'Authentication failed. Please check your credentials.');
    }

    const { access_token: newAccessToken, refresh_token: newRefreshToken } = data.result;

    try {
      const decoded = jwtDecode<DecodedToken>(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setAccessToken(newAccessToken);
      setUser(decoded.payload);
    } catch (error) {
      console.error("FATAL: Received an invalid token from the server.", error);
      throw new Error("Authentication failed due to an invalid server response.");
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const isAuthenticated = !!accessToken && !!user;
  const value = { user, accessToken, isAuthenticated, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

