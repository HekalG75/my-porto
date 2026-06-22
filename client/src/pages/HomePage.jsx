import Navbar from '../components/public/Navbar';
import HeroSection from '../components/public/HeroSection';
import StatsSection from '../components/public/StatsSection';
import ProjectsSection from '../components/public/ProjectsSection';
import CertificatesSection from '../components/public/CertificatesSection';
import AboutSection from '../components/public/AboutSection';
import ContactSection from '../components/public/ContactSection';
import Footer from '../components/public/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-DEFAULT">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProjectsSection />
      <CertificatesSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
