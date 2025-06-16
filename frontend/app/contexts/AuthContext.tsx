'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  // Add other user fields as needed
}

interface DecodedToken {
  payload: User;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; // <-- REFORGED
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to initialize auth state from localStorage on component mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // Optional: Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setAccessToken(storedToken);
          setUser(decoded.payload);
        } else {
          // Token is expired, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
      // Clear storage if token is invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * REFORGED LOGIN FUNCTION
   * - This function now takes credentials (email, password).
   * - It is responsible for making the API call to the backend.
   * - On success, it receives tokens, decodes the user, and sets state.
   * - On failure, it throws an error to be caught by the UI component.
   */
  const login = async (email: string, password: string) => {
    // 1. Make the API call to your backend's login endpoint.
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // 2. Check for failure.
    if (!response.ok || !data.success) {
      // Throw an error that the login page can display to the user.
      throw new Error(data.result || 'Authentication failed.');
    }

    // 3. On success, process the tokens.
    const { access_token: newAccessToken, refresh_token: newRefreshToken } = data.result;

    try {
      // 4. Decode the new access token to get user payload.
      const decoded = jwtDecode<DecodedToken>(newAccessToken);

      // 5. Persist tokens and update application state.
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setAccessToken(newAccessToken);
      setUser(decoded.payload);

    } catch (error) {
      // This catch block handles the case where the backend returns a malformed token.
      console.error("Received an invalid token from the server.", error);
      throw new Error("Authentication failed due to an invalid server response.");
    }
  };

  const logout = () => {
    // Clear user state and remove tokens from storage
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // NOTE: Optionally call the backend's /logout endpoint to invalidate the refresh token server-side.
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
