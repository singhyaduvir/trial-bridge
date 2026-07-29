// components/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import DashboardNavLink from '@/components/DashboardNavLink';

const Header = () => {

  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center">
        <div className="mr-4 gemini-brand-icon">
          <Image 
            src="/SeparateLogo.png" 
            alt="Trial Bridge Logo" 
            width={75} 
            height={75} 
            className="rounded-full bg-gemini-canvas"
          />
        </div>

        <div className="font-bold text-3xl flex items-center gemini-gradient-text">
          CliniQ
        </div>
      </div>
      <nav className="hidden md:flex space-x-8 font-medium">
        <Link href="/" className="gemini-nav-link">Home</Link>
        <DashboardNavLink />
        <Link href="/login?mode=signup" className="gemini-nav-link">Get Started</Link>
        <Link href="/how-it-works" className="gemini-nav-link">How it Works</Link>
        <Link href="/about" className="gemini-nav-link">About</Link>
        <Link href="/login" className="gemini-nav-link">Login</Link>
      </nav>
    </header>
  );
};

export default Header;
