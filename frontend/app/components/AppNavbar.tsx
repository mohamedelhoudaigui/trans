'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

/**
 * AppNavbar: The master orchestrator for the main application navigation bar.
 * - Its responsibility is simplified to laying out the main navigation links
 *   and delegating complex UI (like dropdowns) to specialized child components.
 * - This structure adheres to the single responsibility principle and modular design.
 * - It uses the `usePathname` hook to apply active styling to the correct nav link.
 */
export default function AppNavbar() {
  const pathname = usePathname();

  /**
   * Determines the CSS class for a navigation link based on the current URL path.
   * @param href The link's target URL.
   * @returns 'nav-link-active' if the current path starts with the link's href,
   *          otherwise returns 'nav-link'.
   */
  const getNavLinkClass = (href: string) => {
    // Using startsWith allows parent routes (e.g., /profile) to stay active
    // even when on a child route (e.g., /profile/1).
    return pathname.startsWith(href) ? 'nav-link-active' : 'nav-link';
  };

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
          {/* Notification Menu would be placed here when built */}
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
}
