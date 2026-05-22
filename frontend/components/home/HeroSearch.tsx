'use client';

import { motion } from 'motion/react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();

  return (
    <section className="pt-16 pb-24 px-6 text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-8"
      >
        <span className="text-sm">🇳🇬</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nigeria's #1 originality checker
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
      >
        You just bought it? <br />
        Now check if it's{' '}
        <span className="text-brand-purple font-serif italic relative">
          original
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-6 -right-16 border-2 border-brand-purple text-brand-purple text-[10px] font-black px-2 py-1 rounded-sm leading-none tracking-tighter"
          >
            QUALITY<br />ORIGINAL<br />QUALITY
          </motion.div>
        </span>
      </motion.h1>

      <motion.button
        onClick={() => router.push('/upload')}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-brand-purple text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 mx-auto shadow-lg shadow-brand-purple/20"
      >
        <Upload size={20} />
        Upload image
      </motion.button>
    </section>
  );
}
