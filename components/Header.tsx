// components/Header.tsx
import Link from 'next/link';
import Image from 'next/image'; 


const Header = () => {

  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center">
        {/* <div className="mr-4">
          <Image 
            src="/logo.png" 
            alt="Trial Bridge Logo" 
            width={300} 
            height={200} 
            className="rounded-full"
          />
        </div> */}

        <div className="font-bold text-2xl text-blue-900 flex items-center">
          <span className="text-green-500 mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </span>
          TRIAL<span className="text-green-500">BRIDGE</span>
        </div>
      </div>
      <nav className="hidden md:flex space-x-8 text-blue-900 font-medium">
        <Link href="/" className="hover:text-green-500 transition-colors">Home</Link>
        <Link href="/get-started" className="hover:text-green-500 transition-colors">Get Started</Link>
        <Link href="/how-it-works" className="hover:text-green-500 transition-colors">How it Works</Link>
        <Link href="/about" className="hover:text-green-500 transition-colors">About</Link>
        <Link href="/login" className="hover:text-green-500 transition-colors">Login</Link>
      </nav>
    </header>
  );
};

export default Header;