'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  const router = useRouter();
  return (
    <section className="py-24 px-6 text-center">
      <h2 className="text-4xl font-bold mb-6">Start verifying now</h2>
      <p className="text-gray-500 mb-10 max-w-md mx-auto">
        Don't risk your health or money. Check any product in seconds.
      </p>
      <button
        onClick={() => router.push('/upload')}
        className="bg-brand-purple text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 mx-auto shadow-lg shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all"
      >
        Verify a product <ArrowRight size={20} />
      </button>
    </section>
  );
}