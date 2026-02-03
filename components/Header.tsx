// components/Header.tsx
import Link from 'next/link';
import Image from 'next/image'; 


const Header = () => {

  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center">
        <div className="mr-4">
          <Image 
            src="/SeparateLogo.png" 
            alt="Trial Bridge Logo" 
            width={75} 
            height={75} 
            className="rounded-full"
          />
        </div>

        <div className="font-bold text-3xl text-blue-900 flex items-center">
        Clini<span className="text-green-500">Q</span>
        </div>
      </div>
      <nav className="hidden md:flex space-x-8 text-blue-900 font-medium">
        <Link href="/" className="hover:text-green-500 transition-colors">Home</Link>
        <Link href="/get-started" className="hover:text-green-500 transition-colors">Get Started</Link>
        <Link href="/matches" className="hover:text-green-500 transition-colors">Matches</Link>
        <Link href="/how-it-works" className="hover:text-green-500 transition-colors">How it Works</Link>
        <Link href="/about" className="hover:text-green-500 transition-colors">About</Link>
        <Link href="/login" className="hover:text-green-500 transition-colors">Login</Link>
      </nav>
    </header>
  );
};

export default Header;