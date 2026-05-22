
import FAQAccordion from '@/components/support/FAQAccordion';
import ContactForm from '@/components/support/ContactForm';
import ReportProductForm from '@/components/support/ReportProductForm';

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
      <h1 className="text-4xl font-bold">Support</h1>
      <FAQAccordion />
      <ContactForm />
      <ReportProductForm />
    </div>
  );
}