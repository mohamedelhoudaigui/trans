'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// NOTE: This is placeholder data. This should come from your backend.
const NOTIFICATIONS_DATA = [
  { id: '1', type: 'Tournament Invitation', message: "You've been invited to the Weekly Championship", time: '2 minutes ago' },
  { id: '2', type: 'Friend Request', message: 'john_doe wants to be your friend', time: '1 hour ago' },
];

/**
 * AppNavbar: The main navigation bar for authenticated users.
 * - Displays navigation links to different parts of the application.
 * - Uses the Next.js <Link> component for optimized, client-side navigation.
 * - Uses the `usePathname` hook to determine the active page for styling.
 * - Contains the profile dropdown menu and notifications menu.
 * - Handles user logout.
 */

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close menus if clicked outside
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavLinkClass = (href: string) => {
    return pathname === href ? 'nav-link-active' : 'nav-link';
  };

  if (!user) return null; // Don't render navbar if there is no user

  return (
    <div className="navbar-gradient">
      <div className="navbar solid-effect">
        <Link href="/dashboard" className="logo">Pong Transcendence</Link>
        <div className="nav-links">
          <Link href="/play" className={getNavLinkClass('/play')}>Play</Link>
          <Link href="/tournaments" className={getNavLinkClass('/tournaments')}>Tournaments</Link>
          <Link href="/chat" className={getNavLinkClass('/chat')}>Chat</Link>
          <Link href="/dashboard" className={getNavLinkClass('/dashboard')}>Dashboard</Link>
        </div>
        <div className="navbar-right">
          <div className="notification-container" ref={notificationRef}>
            <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              <span className="notification-icon">🔔</span>
              {NOTIFICATIONS_DATA.length > 0 && (
                <span className="notification-badge">{NOTIFICATIONS_DATA.length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-menu">
                <div className="notification-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notification-list">
                  {NOTIFICATIONS_DATA.map((n) => (
                    <div key={n.id} className="notification-item">
                      <p><strong>{n.type}</strong></p>
                      <p>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="profile-menu-container" ref={profileMenuRef}>
            <div className="user-avatar-container" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <img
                src={user.avatar || '/avatars/default.png'}
                alt="Profile Avatar"
                className="user-avatar-image"
              />
              <div className="status-indicator status-online"></div>
            </div>
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <p className="profile-name">{user.name}</p>
                </div>
                <Link href="/profile" className="profile-menu-item">View Profile</Link>
                <Link href="/settings" className="profile-menu-item">Profile Settings</Link>
                <div className="profile-menu-separator"></div>
                <div className="profile-menu-item" onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
