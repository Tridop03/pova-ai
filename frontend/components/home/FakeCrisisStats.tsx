export default function FakeCrisisStats() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
        <span className="text-brand-purple font-serif italic">The numbers</span> of <br /> everyday life
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gray-50 rounded-3xl p-10 relative overflow-hidden">
          <h3 className="text-3xl font-bold mb-4">₦100 billion+</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Counterfeit and substandard products seized and destroyed across Nigeria by NAFDAC & SON.
          </p>
        </div>
        <div className="bg-gray-50 rounded-3xl p-10 relative overflow-hidden">
          <h3 className="text-3xl font-bold mb-4">4,000+</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Illegal drug outlets sealed nationwide during enforcement drives.
          </p>
        </div>
        <div className="bg-gray-50 rounded-3xl p-10 relative overflow-hidden md:col-span-2 lg:col-span-1">
          <h3 className="text-3xl font-bold mb-4">20+</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            States targeted in coordinated anti-counterfeit operations.
          </p>
        </div>
      </div>
    </section>
  );
}