'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { openModal } = useAuthStore();

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-purple rounded-full" />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="/game" className="hover:text-brand-purple transition-colors">Play game</Link>
        <Link href="/support" className="hover:text-brand-purple transition-colors">Contact</Link>
        <button onClick={() => openModal('login')} className="hover:text-brand-purple transition-colors">
          Sign in
        </button>
      </div>

      <button
        onClick={() => openModal('signup')}
        className="px-6 py-2 border border-brand-purple text-brand-purple rounded-full text-sm font-medium hover:bg-brand-purple hover:text-white transition-all flex items-center gap-2"
      >
        Try it for free <ArrowRight size={16} />
      </button>
    </nav>
  );
}