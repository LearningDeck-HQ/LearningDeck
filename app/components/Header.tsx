"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const menuItems = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'About', href: '/about' },
];

const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams?.get('source');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, [source]);

  const isActive = (href: string) => {
    if (href === '/pricing') return pathname === '/pricing';
    if (href.startsWith('/#')) return pathname === '/' || pathname === '';
    return pathname === href;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3 ">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={'/'} className="flex items-center gap-3">
          <Image
            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
            alt="LearningDeck Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[16px] tracking-tight text-gray-800 font-medium">LearningDeck</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-gray-500">
          
          {/* Products / Platform Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button
              type="button"
              className={`transition-colors py-2 ${
                isProductsOpen || isActive('/')
                  ? 'text-[#FF623D] border-b-2 border-[#FF623D] pb-1 font-semibold'
                  : 'hover:text-gray-900'
              }`}
            >
              Platform
            </button>

            {/* Mega Menu Popover */}
            <div
              className={`absolute left-1/2 -translate-x-[35%] top-full z-50 mt-1 w-[900px] rounded border border-gray-200 bg-white  transition-all duration-200 flex overflow-hidden origin-top-left ${
                isProductsOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
              }`}
            >
              {/* Left & Center Main Content */}
              <div className="flex-1 p-8 grid grid-cols-4 gap-8 bg-white">
                
                {/* Platform Column */}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-[#FF623D] mb-6 uppercase">Platform</p>
                    <ul className="space-y-4">
                      {["What's New", "Security", "Integrations"].map((item) => (
                        <li key={item}>
                          <Link href="#" className="text-[14px] font-medium text-gray-700 hover:text-[#FF623D] transition-colors">
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/downloads" className="text-[13px] font-semibold text-blue-600 mt-12 hover:underline inline-flex items-center gap-1">
                    Download LearningDeck <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Design & Build (Spans 2 columns) */}
                <div className="col-span-2">
                  <p className="text-[11px] font-bold tracking-widest text-[#FF623D] mb-6 uppercase">Design & Build</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                    {[
                      { t: 'Spec Hub', d: 'Manage specifications', i: '🎯' },
                      { t: 'Workspaces', d: 'Collaborate with teams', i: '👥' },
                      { t: 'Mock Servers', d: 'Simulate API behavior', i: '🖥️' },
                      { t: 'SDK Generator', d: 'Create SDKs instantly', i: '📦' },
                    ].map((item) => (
                      <Link key={item.t} href="#" className="group block">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-8 w-8 rounded bg-orange-50/50 flex shrink-0 items-center justify-center text-[14px]  border border-orange-100/50 group-hover:bg-orange-100 transition-colors">
                            {item.i}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-gray-900 group-hover:text-[#FF623D] transition-colors">{item.t}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">{item.d}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Test & Validate */}
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-[#FF623D] mb-6 uppercase">Test & Validate</p>
                  <div className="space-y-8">
                    {[
                      { t: 'API Client', d: 'Send API requests', i: '🛡️' },
                      { t: 'Monitors', d: 'Validate performance', i: '📈' },
                    ].map((item) => (
                      <Link key={item.t} href="#" className="group block">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-8 w-8 rounded bg-orange-50/50 flex shrink-0 items-center justify-center text-[14px]  border border-orange-100/50 group-hover:bg-orange-100 transition-colors">
                            {item.i}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-gray-900 group-hover:text-[#FF623D] transition-colors">{item.t}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">{item.d}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar (Gray Background) */}
              <div className="w-[280px] bg-gray-50 p-8 border-l border-gray-100 flex flex-col">
                <p className="text-[11px] font-bold tracking-widest text-[#FF623D] mb-6 uppercase">More From Us</p>
                <div className="space-y-5">
                  {[
                    { t: 'Astro AI', d: 'Manage and control AI agents in production', i: '✨' },
                    { t: 'Fern', d: 'Instantly generate API docs and SDKs', i: '🌿' },
                  ].map((item) => (
                    <Link key={item.t} href="#" className="group block bg-white border border-gray-200 rounded p-4  hover:border-[#FF623D]/30 hover:shadow-md transition-all">
                       <div className="flex items-center gap-2 mb-1.5">
                         <span className="text-[16px]">{item.i}</span>
                         <p className="text-[14px] font-bold text-gray-900 group-hover:text-[#FF623D] flex items-center gap-1 transition-colors">
                            {item.t} <ChevronRight className="w-3 h-3" />
                         </p>
                       </div>
                      <p className="text-[12px] text-gray-500 leading-relaxed">{item.d}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Standard Nav Items */}
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-colors py-2 ${
                isActive(item.href)
                  ? 'text-[#FF623D] border-b-2 border-[#FF623D] pb-1 font-semibold'
                  : 'hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth/CTA Buttons */}
        <div className="flex items-center gap-4">
          {!isLoading && (
            isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-[#FF623D] text-white text-[14px] font-medium px-4 py-2 rounded-md hover:bg-[#E55837] transition-colors flex items-center gap-1 "
              >
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href={`/login${source ? `?source=${source}` : ''}`}
                  className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href={`/signup${source ? `?source=${source}` : ''}`}
                  className="bg-[#FF623D] text-white text-[14px] font-medium px-4 py-2 rounded-md hover:bg-[#E55837] transition-colors flex items-center gap-1 "
                >
                  Get Started <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;