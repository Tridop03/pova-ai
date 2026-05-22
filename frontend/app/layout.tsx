import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastProvider from '@/components/ui/ToastProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'POVA AI — Product Originality Verification',
  description: "Nigeria's #1 AI-powered product authenticity checker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ToastProvider />  {/* Handles the random activity toasts globally */}
      </body>
    </html>
  );
}