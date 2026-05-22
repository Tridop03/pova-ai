import { Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-purple py-20 px-6 text-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="w-12 h-12 bg-white rounded-full mb-8" />
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/game" className="hover:text-white/70 transition-colors">Play game</Link></li>
            <li><Link href="/recalls" className="hover:text-white/70 transition-colors">Recalled products</Link></li>
            <li><Link href="/support" className="hover:text-white/70 transition-colors">Contact</Link></li>
            <li><Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Socials</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Twitter size={14} /> Twitter</a></li>
            <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Linkedin size={14} /> LinkedIn</a></li>
            <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Instagram size={14} /> TikTok</a></li>
            <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Facebook size={14} /> Facebook</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
