'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import DropdownMenu from './DropdownMenu';

/**
 * The specific profile dropdown menu for the authenticated user.
 * - Uses the generic DropdownMenu for its open/close behavior.
 * - Pulls the authenticated user's data from AuthContext to display their name
 *   and provide a dynamic link to their own profile.
 * - Renders the user's avatar as the trigger for the dropdown.
 * - Contains navigation links to key user-specific pages and the logout function.
 */
export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // If there is no user, this component should not render anything.
  if (!user) {
    return null;
  }

  // Handles the logout process and redirects the user to the login page.
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // The trigger component is the user's avatar, which opens the dropdown on click.
  const trigger = (
    <div className="user-avatar-container">
      <img
        src={user.avatar || '/avatars/default.png'}
        alt="Profile Avatar"
        className="user-avatar-image"
        // Fallback for broken avatar links
        onError={(e) => { e.currentTarget.src = '/avatars/default.png'; }}
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
