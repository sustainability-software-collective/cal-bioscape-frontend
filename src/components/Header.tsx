"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-1 flex-shrink-0 w-full">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-10 ml-10">
          {/* Logo and Site Name */}
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
            >
              <Image
                src="/cal-biomap-logo-no-text.png"
                alt="CAL Logo"
                width={48}
                height={48}
                className="h-10 w-10"
                priority
              />
              <span className="text-lg font-medium tracking-wider text-gray-800 uppercase" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontStretch: '104%' }}>
                CAL BIOSCAPE
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="ml-auto flex items-center space-x-12 mr-8">
            <Link 
              href="/"
              className={`text-sm font-medium ${pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
            >
              Map
            </Link>
            <Link 
              href="/about"
              className={`text-sm font-medium ${pathname === '/about' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
            >
              About
            </Link>
            <Link 
              href="/api"
              className={`text-sm font-medium ${pathname === '/api' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
            >
              API
            </Link>
            <Link 
              href="/contact"
              className={`text-sm font-medium ${pathname === '/contact' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
