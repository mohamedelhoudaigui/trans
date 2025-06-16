'use client';

import AuthGuard from '../components/AuthGuard';
import AppNavbar from '../components/AppNavbar';

/**
 * ProtectedLayout: The wrapper for all pages that require authentication.
 * - It uses the <AuthGuard> component to shield its children, redirecting
 *   unauthenticated users to the login page.
 * - It renders the main application navbar (<AppNavbar>), making it consistent
 *   across all authenticated sections of the app.
 * - The main content of each page is rendered as {children}.
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="app-container">
        <AppNavbar />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
