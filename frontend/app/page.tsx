import HeroSearch from '@/components/home/HeroSearch';
import HowItWorks from '@/components/home/HowItWorks';
import FakeCrisisStats from '@/components/home/FakeCrisisStats';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <HowItWorks />
      <FakeCrisisStats />
      <Testimonials />
      <CallToAction />
    </>
  );
}