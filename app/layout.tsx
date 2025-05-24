"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add this constant for notifications
const NOTIFICATIONS_DATA = [
  {
    id: '1',
    type: 'Tournament Invitation',
    message: "You've been invited to the Weekly Championship",
    time: '2 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'Friend Request',
    message: 'john_doe wants to be your friend',
    time: '1 hour ago',
    read: false
  },
  {
    id: '3',
    type: 'Game Result',
    message: 'You won against alice_player!',
    time: '3 hours ago',
    read: false
  }
];

interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'in-game' | 'offline';
}

// Create navigation context
interface NavigationContextType {
  currentPage: string;
  navigateTo: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'home',
  navigateTo: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Constants
  const DEFAULT_AVATAR = '/avatars/default.png';
const NOTIFICATION_ICON = '🔔';

  const [currentUser, setCurrentUser] = useState<User>({
    id: 'me',
    username: 'Makram Boukaiz',
    avatar: '/avatars/default.png',
    status: 'online'
  });
  
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [notificationCount, setNotificationCount] = useState<number>(3); // Example notification count
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || getPageFromHash();
      setCurrentPage(page);
    };

    const getPageFromHash = () => {
      const hash = window.location.hash.slice(1);
      return hash || 'home';
    };

    // Set initial page from URL
    setCurrentPage(getPageFromHash());

    // Listen for browser navigation
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navigate to page (updates URL and history)
  const navigateTo = (page: string) => {
    const newUrl = `${window.location.pathname}#${page}`;
    window.history.pushState({ page }, '', newUrl);
    setCurrentPage(page);
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Profile menu functions
  const handleProfileClick = (): void => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false); // Close notifications when opening profile
  };

  const handleNotificationClick = (): void => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false); // Close profile when opening notifications
  };

  const handleViewProfile = (): void => {
    setShowProfileMenu(false);
    navigateTo('profile');
  };

  const handleProfileSettings = (): void => {
    setShowProfileMenu(false);
    navigateTo('profile-settings');
  };

  const handleLogout = (): void => {
    setShowProfileMenu(false);
    alert('Logging out...');
  };

  // Get status text
  const getStatusText = (status: 'online' | 'in-game' | 'offline'): string => {
    switch(status) {
      case 'online': return 'Online';
      case 'in-game': return 'In Game';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  // Get active nav link
  const getNavLinkClass = (page: string): string => {
    return currentPage === page ? 'nav-link-active' : 'nav-link';
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased app-container`}
      >
        <NavigationContext.Provider value={{ currentPage, navigateTo }}>
          {/* Navbar */}
          <div className="navbar-gradient">
            <div className="navbar solid-effect">
              <button 
                onClick={() => navigateTo('home')} 
                className="logo"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Pong Transcendence
              </button>
              
              <div className="nav-links">
                <button 
                  onClick={() => navigateTo('play')} 
                  className={getNavLinkClass('play')}
                  style={{ background: 'none', border: 'none' }}
                >
                  Play
                </button>
                <button 
                  onClick={() => navigateTo('tournaments')} 
                  className={getNavLinkClass('tournaments')}
                  style={{ background: 'none', border: 'none' }}
                >
                  Tournaments
                </button>
                <button 
                  onClick={() => navigateTo('chat')} 
                  className={getNavLinkClass('chat')}
                  style={{ background: 'none', border: 'none' }}
                >
                  Chat
                </button>
                <button 
                  onClick={() => navigateTo('dashboard')} 
                  className={getNavLinkClass('dashboard')}
                  style={{ background: 'none', border: 'none' }}
                >
                  Dashboard
                </button>
              </div>

              <div className="navbar-right">
                {/* Notification Button */}
                <div className="notification-container" ref={notificationRef}>
                  <button 
                    className="notification-button"
                    onClick={handleNotificationClick}
                  >
                    <span className="notification-icon">{NOTIFICATION_ICON}</span>
                    {notificationCount > 0 && (
                      <span className="notification-badge">{notificationCount}</span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="notification-menu">
                      <div className="notification-header">
                        <h3>Notifications</h3>
                        <span className="notification-count">{notificationCount} new</span>
                      </div>
                      <div className="notification-list">
                      {NOTIFICATIONS_DATA.map((notification) => (
                        <div key={notification.id} className="notification-item">
                          <p><strong>{notification.type}</strong></p>
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      ))}
                    </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="profile-menu-container" ref={profileMenuRef}>
                  <div 
                    className="user-avatar-container"
                    onClick={handleProfileClick}
                  >
                    <img 
                      src={currentUser.avatar || DEFAULT_AVATAR}
                      alt="Profile Avatar"
                      className="user-avatar-image"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div className={`status-indicator status-${currentUser.status}`}></div>
                  </div>
                  
                  {showProfileMenu && (
                    <div className="profile-menu">
                      <div className="profile-info">
                        <p className="profile-name">{currentUser.username}</p>
                        <p className="profile-status">{getStatusText(currentUser.status)}</p>
                      </div>
                      <div 
                        className="profile-menu-item"
                        onClick={handleViewProfile}
                      >
                        View Profile
                      </div>
                      <div 
                        className="profile-menu-item"
                        onClick={handleProfileSettings}
                      >
                        Profile Settings
                      </div>
                      <div className="profile-menu-separator"></div>
                      <div 
                        className="profile-menu-item"
                        onClick={handleLogout}
                      >
                        Logout
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="layout-content">
            {children}
          </div>
        </NavigationContext.Provider>
      </body>
    </html>
  );
}