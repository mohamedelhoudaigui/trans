'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

// ======================================================================================
// I. DATA CONTRACTS & INTERFACES
// ======================================================================================

interface Notification {
  id: string;
  type: 'Friend Request' | 'Game Invite' | 'Tournament Invitation' | 'Game Result'; // Maybe invite to lobby ...
  message: string;
  time: string;
}

// ======================================================================================
// II. SUB-COMPONENTS (Axiom V.A: Small Gods, Big Universe)
// ======================================================================================

/**
 * ProfileMenu: A dedicated component for the user profile dropdown.
 * - Receives user data and logout function as props.
 * - Renders the user's name and provides navigation links.
 */
const ProfileMenu = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <div className="profile-menu">
    <div className="profile-info">
      <p className="profile-name">{user.name}</p>
      {/* TODO: Add real-time status text */}
      <p className="profile-status">Online</p> 
    </div>
    {/* DYNAMIC LINK: Navigates to the specific user's profile page */}
    <Link href={`/profile/${user.id}`} className="profile-menu-item">
      View Profile
    </Link>
    <Link href="/settings" className="profile-menu-item">
      Profile Settings
    </Link>
    <div className="profile-menu-separator"></div>
    <div className="profile-menu-item" onClick={onLogout}>
      Logout
    </div>
  </div>
);

/**
 * NotificationMenu: A dedicated component for the notifications dropdown.
 * - Receives a list of notifications as props.
 * - Renders the list and provides a summary.
 */
const NotificationMenu = ({ notifications }: { notifications: Notification[] }) => (
  <div className="notification-menu">
    <div className="notification-header">
      <h3>Notifications</h3>
      {notifications.length > 0 && (
        <span className="notification-count">{notifications.length} new</span>
      )}
    </div>
    <div className="notification-list">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div key={notification.id} className="notification-item">
            <p><strong>{notification.type}</strong></p>
            <p>{notification.message}</p>
            <span className="notification-time">{notification.time}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center p-4">No new notifications.</p>
      )}
    </div>
  </div>
);


// ======================================================================================
// III. MAIN NAVBAR COMPONENT
// ======================================================================================

/**
 * AppNavbar: The main navigation bar for authenticated users.
 * - Manages the state for its sub-menus (Profile & Notifications).
 * - Fetches and displays dynamic data like notifications.
 * - Provides consistent navigation across the authenticated application.
 */
export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // --- State Management ---
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- Refs for closing menus on outside click ---
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching & Side Effects ---

  // Fetch notifications on component mount.
  useEffect(() => {
    // TODO: Implement a real API endpoint for fetching notifications.
    const fetchNotifications = async () => {
      console.warn("Notification fetching is not implemented. Using placeholder data.");
      setNotifications([
        { id: '1', type: 'Game Invite', message: "PlayerX challenges you to a match!", time: '2m ago' },
        { id: '2', type: 'Friend Request', message: 'User_42 wants to be your friend', time: '1h ago' },
      ]);
    };
    fetchNotifications();
  }, []);

  // Effect to handle clicks outside of the dropdown menus to close them.
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


  // --- Event Handlers ---

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavLinkClass = (href: string) => {
    return pathname.startsWith(href) ? 'nav-link-active' : 'nav-link';
  };
  
  if (!user) {
    // This is a safeguard. The AuthGuard should prevent this from ever being seen.
    return null;
  }

  // --- Main Render ---
  return (
    <div className="navbar-gradient">
      <div className="navbar solid-effect">
        <Link href="/dashboard" className="logo">Pong Transcendence</Link>
        <div className="nav-links">
          {/* We use startsWith in getNavLinkClass for parent routes like /profile */}
          <Link href="/play" className={getNavLinkClass('/play')}>Play</Link>
          <Link href="/tournaments" className={getNavLinkClass('/tournaments')}>Tournaments</Link>
          <Link href="/chat" className={getNavLinkClass('/chat')}>Chat</Link>
          <Link href="/dashboard" className={getNavLinkClass('/dashboard')}>Dashboard</Link>
        </div>
        <div className="navbar-right">
          <div className="notification-container" ref={notificationRef}>
            <button className="notification-button" onClick={() => setShowNotifications(prev => !prev)}>
              <span className="notification-icon">🔔</span>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            {showNotifications && <NotificationMenu notifications={notifications} />}
          </div>

          <div className="profile-menu-container" ref={profileMenuRef}>
            <div className="user-avatar-container" onClick={() => setShowProfileMenu(prev => !prev)}>
              <img
                src={user.avatar || '/avatars/default.png'}
                alt="Profile Avatar"
                className="user-avatar-image"
              />
              <div className="status-indicator status-online"></div>
            </div>
            {showProfileMenu && <ProfileMenu user={user} onLogout={handleLogout} />}
          </div>
        </div>
      </div>
    </div>
  );
}
