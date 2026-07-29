import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CliniQ | TrialBridge",
  description: "Match patients to clinical trials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
