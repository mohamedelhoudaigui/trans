'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import DropdownMenu from './DropdownMenu';

/**
 * The specific profile dropdown menu for the authenticated user.
 * - Uses the generic DropdownMenu for its behavior.
 * - Pulls the authenticated user's data from AuthContext.
 * - Renders the user's avatar as the trigger.
 * - Provides dynamic links to the user's own profile and settings.
 * - Contains the logout functionality.
 */
export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null; // Do not render if there's no user

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const trigger = (
    <div className="user-avatar-container">
      <img
        src={user.avatar || '/avatars/default.png'}
        alt="Profile Avatar"
        className="user-avatar-image"
      />
      <div className="status-indicator status-online"></div>
    </div>
  );

  return (
    <DropdownMenu trigger={trigger}>
      <div className="profile-info">
        <p className="profile-name">{user.name}</p>
        <p className="profile-status">Online</p>
      </div>
      <Link href={`/profile/${user.id}`} className="profile-menu-item">
        View Profile
      </Link>
      <Link href="/settings" className="profile-menu-item">
        Profile Settings
      </Link>
      <div className="profile-menu-separator"></div>
      <div className="profile-menu-item" onClick={handleLogout}>
        Logout
      </div>
    </DropdownMenu>
  );
}
