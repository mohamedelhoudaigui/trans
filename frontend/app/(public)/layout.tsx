
/**
 * PublicLayout: A minimal layout for pages accessible to everyone.
 * Its purpose is to create a distinct structural boundary for public routes,
 * ensuring they do not inherit the main application's authenticated UI (like the navbar).
 * It simply renders its children within the main app container styles.
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-container">
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
}
