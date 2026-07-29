import Header from '@/components/Header';

type PageShellProps = {
  children: React.ReactNode;
  /** Set true if child is full-bleed (dashboards) */
  fullWidth?: boolean;
};

export default function PageShell({ children, fullWidth }: PageShellProps) {
  return (
    <main className="min-h-screen bg-gemini-canvas">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Header />
      </div>
      {fullWidth ? children : (
        <div className="mx-auto max-w-7xl px-6 lg:px-8">{children}</div>
      )}
    </main>
  );
}
