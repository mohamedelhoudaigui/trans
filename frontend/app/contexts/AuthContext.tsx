'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// ======================================================================================
// I. DATA CONTRACTS & INTERFACES (Axiom V.B: Ironclad Interfaces)
// These define the shape of our data. They are non-negotiable.
// ======================================================================================

/**
 * User: The core user object, representing the authenticated individual.
 * This must match the payload of the JWT from the backend.
 */
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  wins: number;
  loses: number;
}

/**
 * DecodedToken: The structure of the JWT payload after decoding.
 */
interface DecodedToken {
  payload: User;
  iat: number; // Issued At timestamp
  exp: number; // Expiration timestamp
}

/**
 * AuthContextType: The public interface of our authentication service.
 * These are the functions and state that will be exposed to the rest of the application.
 */
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ======================================================================================
// II. ENVIRONMENT VALIDATION (Axiom II: Absolute Sovereignty)
// The system must know its environment or refuse to run. No guesswork.
// ======================================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  // This is a hard failure. The application is misconfigured and cannot proceed.
  throw new Error("FATAL_ERROR: NEXT_PUBLIC_API_BASE_URL is not defined in the environment. The application cannot communicate with the backend.");
}

// ======================================================================================
// III. CONTEXT DEFINITION & PROVIDER
// ======================================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider: The component that provides the authentication state and logic
 * to its entire child tree. It is the "source of truth" for auth.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to handle initial load

  /**
   * Initializes auth state from localStorage on the first client-side render.
   * This effect ensures that if a user reloads the page, they remain logged in
   * if their token is still valid.
   */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // Security Check: Verify the token is not expired.
        if (decoded.exp * 1000 > Date.now()) {
          setAccessToken(storedToken);
          setUser(decoded.payload);
        } else {
          // Token is expired. Purge it.
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error("Auth init failed: Invalid token found in storage.", error);
      // Purge invalid tokens to prevent login loops.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      // Signal that the initial auth check is complete.
      setIsLoading(false);
    }
  }, []);

  /**
   * login: Handles the user authentication flow.
   * - Takes user credentials.
   * - Communicates with the backend API.
   * - Processes the response, sets state, and persists tokens.
   * - Throws specific errors for the UI to handle.
   */
  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    // We must read the response body to determine success or failure.
    const data = await response.json();

    // Check for a failed request (e.g., 401 Unauthorized) OR a failed logical operation.
    if (!response.ok || !data.success) {
      // Throw the specific error message from the backend's 'result' field.
      // This provides clear feedback to the user on the login page.
      throw new Error(data.result || 'Authentication failed. Please check your credentials.');
    }

    // --- SUCCESS PATH ---
    const { access_token: newAccessToken, refresh_token: newRefreshToken } = data.result;

    try {
      const decoded = jwtDecode<DecodedToken>(newAccessToken);

      // Persist tokens to localStorage for session persistence.
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update the application's live state.
      setAccessToken(newAccessToken);
      setUser(decoded.payload);

    } catch (error) {
      // This block handles a critical error: the backend sent a malformed JWT.
      console.error("FATAL: Received an invalid token from the server after a successful login.", error);
      throw new Error("Authentication failed due to an invalid server response.");
    }
  };

  /**
   * logout: Clears the user's session from the frontend.
   */
  const logout = () => {
    // Clear the live application state.
    setUser(null);
    setAccessToken(null);

    // Purge the session from persistent storage.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // NOTE: A more robust implementation would also call a backend endpoint
    // to invalidate the refresh token on the server-side.
  };

  // Derived state: isAuthenticated is true only if we have both a token and a user object.
  const isAuthenticated = !!accessToken && !!user;

  // The value provided to all consuming components.
  const value = { user, accessToken, isAuthenticated, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth: A custom hook for easy consumption of the AuthContext.
 * - Provides a clean, reusable interface to the auth state.
 * - Enforces that it is only used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
