import { Navigate } from 'react-router-dom';
import { getToken, isTokenValid } from '../utils/auth';

import Navbar        from '../components/landing/Navbar';
import Hero          from '../components/landing/Hero';
import About         from '../components/landing/About';
import Services      from '../components/landing/Services';
import ValueAdded    from '../components/landing/ValueAdded';
import Pricing       from '../components/landing/Pricing';
import WhyChoose     from '../components/landing/WhyChoose';
import Testimonials  from '../components/landing/Testimonials';
import Faq           from '../components/landing/Faq';
import ContactFooter from '../components/landing/ContactFooter';

export default function LandingPage() {
  const token = getToken();
  if (isTokenValid(token)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <ValueAdded />
        <Pricing />
        <WhyChoose />
        <Testimonials />
        <Faq />
        <ContactFooter />
      </main>
    </div>
  );
}
