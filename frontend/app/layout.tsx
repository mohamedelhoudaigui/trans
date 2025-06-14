"use client";

// --- FIXED --- Replaced Geist with the standard 'Inter' Google Font
import { Inter } from "next/font/google";
import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import "./globals.css";

// --- NEW --- Import our AuthProvider and useAuth hook for authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- Font setup using Inter ---
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter', // Optional: if you want to use it as a CSS variable
});

const NOTIFICATIONS_DATA = [
  { id: '1', type: 'Tournament Invitation', message: "You've been invited to the Weekly Championship", time: '2 minutes ago', read: false },
  { id: '2', type: 'Friend Request', message: 'john_doe wants to be your friend', time: '1 hour ago', read: false },
  { id: '3', type: 'Game Result', message: 'You won against alice_player!', time: '3 hours ago', read: false }
];

// --- Your existing Navigation Context ---
interface NavigationContextType {
  currentPage: string;
  navigateTo: (page: string) => void;
}
const NavigationContext = createContext<NavigationContextType>({ currentPage: 'home', navigateTo: () => {} });
export const useNavigation = () => useContext(NavigationContext);

// --- Inner Layout Component ---
const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { currentPage, navigateTo } = useNavigation();

  const DEFAULT_AVATAR = '/avatars/default.png';
  const NOTIFICATION_ICON = '🔔';

  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(3);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setShowProfileMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => setShowProfileMenu(!showProfileMenu);
  const handleNotificationClick = () => setShowNotifications(!showNotifications);


  const handleLogout = () => {
    logout(); 
    window.location.href = '/';
  };

  const getStatusText = (status: 'online' | 'in-game' | 'offline'): string => 'Online';
  const getNavLinkClass = (page: string): string => currentPage === page ? 'nav-link-active' : 'nav-link';

  return (
    <div className="app-container">
      {!isLoading && (
        <div className="navbar-gradient">
          <div className="navbar solid-effect">
            <button onClick={() => navigateTo('home')} className="logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Pong Transcendence
            </button>
            <div className="nav-links">
              <button onClick={() => navigateTo('play')} className={getNavLinkClass('play')} style={{ background: 'none', border: 'none' }}>Play</button>
              <button onClick={() => navigateTo('tournaments')} className={getNavLinkClass('tournaments')} style={{ background: 'none', border: 'none' }}>Tournaments</button>
              <button onClick={() => navigateTo('chat')} className={getNavLinkClass('chat')} style={{ background: 'none', border: 'none' }}>Chat</button>
              <button onClick={() => navigateTo('dashboard')} className={getNavLinkClass('dashboard')} style={{ background: 'none', border: 'none' }}>Dashboard</button>
            </div>
            <div className="navbar-right">
              {isAuthenticated && user ? (
                <>
                  <div className="notification-container" ref={notificationRef}>{/* ...notifications... */}</div>
                  <div className="profile-menu-container" ref={profileMenuRef}>
                    <div className="user-avatar-container" onClick={handleProfileClick}>
                      <img src={user.avatar || DEFAULT_AVATAR} alt="Profile Avatar" className="user-avatar-image" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}/>
                      <div className="status-indicator status-online"></div>
                    </div>
                    {showProfileMenu && (
                      <div className="profile-menu">
                        <div className="profile-info">
                          <p className="profile-name">{user.name}</p>
                          <p className="profile-status">{getStatusText('online')}</p>
                        </div>
                        <div className="profile-menu-item" onClick={() => navigateTo('profile')}>View Profile</div>
                        <div className="profile-menu-item" onClick={() => navigateTo('profile-settings')}>Profile Settings</div>
                        <div className="profile-menu-separator"></div>
                        <div className="profile-menu-item" onClick={handleLogout}>Logout</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="nav-link">Login</Link>
                  <Link href="/register" className="nav-link-active">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="layout-content">{children}</div>
    </div>
  );
};

// --- Root Component ---
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<string>('home');

  const navigateTo = (page: string) => {
    const newUrl = `${window.location.pathname}#${page}`;
    window.history.pushState({ page }, '', newUrl);
    setCurrentPage(page);
  };
  
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || window.location.hash.slice(1) || 'home';
      setCurrentPage(page);
    };
    navigateTo(window.location.hash.slice(1) || 'home');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <html lang="en">
      {/* Apply the font class to the body */}
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <NavigationContext.Provider value={{ currentPage, navigateTo }}>
            <AppLayout>{children}</AppLayout>
          </NavigationContext.Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
