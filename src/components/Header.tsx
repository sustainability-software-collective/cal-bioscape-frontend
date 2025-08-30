import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <div className="flex items-center">
        <Image
          src="/biocirv_logo_full_text.png"
          alt="BioCirv Siting Tool Logo"
          width={300}
          height={90}
          className="h-16 w-auto"
          priority
        />
      </div>
    </header>
  );
}
