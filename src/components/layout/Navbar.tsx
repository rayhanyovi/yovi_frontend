'use client';

import Image from 'next/image';
import { UserDropdown } from './UserDropdown';

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-40"
      style={{ background: 'linear-gradient(90deg, #11191A 0%, #296377 100%)' }}
    >
      <div className="flex items-center justify-between h-full px-5">
        <div className="flex items-center gap-3">
          <Image
            src="/company-logo.png"
            alt="FTL Logo"
            width={72}
            height={28}
            className="object-contain"
            priority
          />
          <span className="text-white font-semibold text-base tracking-wide">iMeeting</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="cursor-pointer text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
