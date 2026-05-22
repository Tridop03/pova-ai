'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Sparkles, CheckSquare, Camera } from 'lucide-react';

export default function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const steps = [
    {
      title: 'Snap & upload',
      desc: 'Capture all sides of the product and submit it for review.',
      icon: <Maximize size={32} className="text-gray-300" />,
      img: 'https://picsum.photos/seed/scan1/800/1000',
    },
    {
      title: 'Smart AI analysis',
      desc: 'Our AI analyzes packaging design, labels, NAFDAC data and other identifiers against verified records.',
      icon: <Sparkles size={32} className="text-gray-300" />,
      img: 'https://picsum.photos/seed/scan2/800/1000',
    },
    {
      title: 'Instant clarity',
      desc: "Know immediately if it's authentic or potentially fake.",
      icon: <CheckSquare size={32} className="text-gray-300" />,
      img: 'https://picsum.photos/seed/scan3/800/1000',
    },
  ];

  return (
    <section className="bg-brand-purple py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-white text-4xl md:text-5xl font-bold text-center mb-16">
          How it works in <br /> 3 simple steps
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="bg-white rounded-3xl p-8 h-[400px] flex flex-col justify-between relative overflow-hidden cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full border border-brand-purple/20 flex items-center justify-center text-brand-purple font-bold mb-6">
                  {idx + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
              </div>

              <div className="flex justify-end relative z-10">{step.icon}</div>

              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                  >
                    <img
                      src={step.img}
                      alt={step.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                      {idx === 0 && (
                        <div className="border-2 border-white/50 w-32 h-48 rounded-lg flex items-center justify-center">
                          <Camera className="text-white" size={40} />
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="space-y-4 w-full">
                          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                              className="h-full bg-white w-1/3"
                            />
                          </div>
                          <div className="text-white font-mono text-[10px] opacity-70">
                            ANALYZING_NAFDAC_RECORDS...
                          </div>
                        </div>
                      )}
                      {idx === 2 && (
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckSquare className="text-white" />
                          </div>
                          <div className="text-white font-bold">99% ORIGINAL</div>
                        </div>
                      )}
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