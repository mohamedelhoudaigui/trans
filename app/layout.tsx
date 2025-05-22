"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'in-game' | 'offline';
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'me',
    username: 'Makram Boukaiz',
    avatar: '/avatars/makram.jpg',
    status: 'online'
  });
  
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
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
  };

const handleViewProfile = (): void => {
  setShowProfileMenu(false);
  window.location.href = '/profile';
};

  const handleProfileSettings = (): void => {
    setShowProfileMenu(false);
    alert('Opening profile settings...');
  };

  const handleLogout = (): void => {
    setShowProfileMenu(false);
    alert('Logging out...');
  };

  // Get user initials for avatar
  const getUserInitials = (username: string): string => {
    if (!username) return '';
    const names = username.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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
  const getNavLinkClass = (path: string): string => {
    return pathname === path ? 'nav-link-active' : 'nav-link';
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased app-container`}
      >
        {/* Navbar */}
        <div className="navbar-gradient">
          <div className="navbar solid-effect">
            <Link href="/" className="logo">
              Pong Transcendence
            </Link>
            <div className="nav-links">
              <Link href="/play" className={getNavLinkClass('/play')}>
                Play
              </Link>
              <Link href="/tournaments" className={getNavLinkClass('/tournaments')}>
                Tournaments
              </Link>
              <Link href="/chat" className={getNavLinkClass('/chat')}>
                Chat
              </Link>
              <Link href="/profile" className={getNavLinkClass('/profile')}>
                Profile
              </Link>
            </div>
            <div className="profile-menu-container" ref={profileMenuRef}>
              <div 
                className="user-avatar"
                onClick={handleProfileClick}
              >
                {getUserInitials(currentUser.username)}
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

        {/* Page Content */}
        <div className="layout-content">
          {children}
        </div>
      </body>
    </html>
  );
}