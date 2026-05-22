'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';

const testimonials = [
  {
    name: 'Amara, 23',
    text: '"I bought a popular skincare serum online and something felt off. I searched it here and saw the packaging differences immediately. It turned out to be fake. This platform saved my skin."',
    img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Abdul, 42',
    text: '"I always worry about fake medicines for my kids. Being able to check the product before using it gives me peace of mind. Every parent in Nigeria needs this."',
    img: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tunde, 29',
    text: '"I bought a phone charger that looked original but kept overheating. After checking here, I realized it was not authentic. Now I verify before I buy anything tech."',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Testimonials() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          How we are keeping <br />
          <span className="text-brand-purple font-serif italic">Nigerians safe</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="bg-white rounded-3xl p-10 h-[320px] flex flex-col justify-between relative overflow-hidden cursor-pointer border border-gray-100"
            >
              <div className="relative z-10">
                <MessageCircle size={24} className="text-gray-300 mb-6" />
                <p className="text-gray-600 text-sm leading-relaxed italic">{t.text}</p>
              </div>
              <div className="relative z-10">
                <p className="font-bold text-gray-400 text-xs">{t.name}</p>
              </div>

              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                  >
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <p className="text-white font-bold text-lg mb-1">{t.name}</p>
                      <p className="text-white/70 text-xs line-clamp-2">{t.text}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}