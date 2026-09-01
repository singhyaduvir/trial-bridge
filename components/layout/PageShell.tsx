import Header from '@/components/Header';

type PageShellProps = {
  children: React.ReactNode;
  /** Set true if child is full-bleed (dashboards) */
  fullWidth?: boolean;
};

export default function PageShell({ children, fullWidth }: PageShellProps) {
  return (
    <main className="min-h-screen bg-gemini-canvas">
      {/* Header stays within padding but not constrained to a narrow max-width */}
      <div className="w-full px-6 lg:px-8">
        <Header />
      </div>

      {/* If a child wants full-bleed it will render as-is; otherwise allow content to use the full width with page padding */}
      {fullWidth ? (
        children
      ) : (
        <div className="w-full px-6 lg:px-8">{children}</div>
      )}
    </main>
  );
}
