import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-2">
      <div className="flex items-center">
        <div className="w-70 pl-4 flex items-center justify-center">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
          >
            <Image
              src="/cal-biomap-logo-no-text.png"
              alt="CAL BIOMAP Logo"
              width={52}
              height={52}
              className="h-11 w-11"
              priority
            />
            <span className="text-xl font-medium tracking-wider text-gray-800 uppercase" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontStretch: '104%' }}>
              CAL BIOSCAPE
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
