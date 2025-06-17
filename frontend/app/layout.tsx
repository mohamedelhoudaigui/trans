// frontend/app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from './contexts/AuthContext';
import "./globals.css";

// export const metadata: Metadata = {
//   title: "Pong Transcendence",
//   description: "The Ultimate Pong Experience",
// };

/**
 * RootLayout: The foundational layout for the entire application.
 * - It applies the global stylesheet.
 * - It wraps everything in the AuthProvider, making authentication state
 *   available to all components, client or server. This is the root
 *   of our state tree for authentication.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
