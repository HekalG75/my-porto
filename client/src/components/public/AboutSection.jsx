import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AboutSection() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile(data.data)).catch(() => { });
  }, []);

  const imgSrc = profile?.about_image_url ? `${API_URL}${profile.about_image_url}` : null;

  const highlights = [
    'Fresh Graduate dengan 1+ tahun pengalaman kerja lepas',
    'Menguasai Excel, CodeIgniter, dan MySQL',
    'Selalu mengikuti perkembangan teknologi terbaru',
    'Berorientasi pada kualitas dan user experience (UX)',
  ];

  return (
    <section id="about" className="py-20 bg-dark-DEFAULT grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="relative flex justify-center order-first lg:order-none pb-10 lg:pb-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-110" />
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-primary/20 to-dark-300 border-2 border-primary/30 overflow-hidden">
                {imgSrc ? (
                  <img src={imgSrc} alt="About" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">👨‍💻</div>
                )}
              </div>

              {/* Stats floating cards */}
              <div className="absolute -bottom-6 -right-6 glass rounded-2xl p-4 text-center">
                <div className="text-primary font-black text-2xl">{profile?.stat_projects || '50'}+</div>
                <div className="text-gray-400 text-xs">Projects Done</div>
              </div>
              <div className="absolute -top-6 -left-6 glass rounded-2xl p-4 text-center">
                <div className="text-primary font-black text-2xl">{profile?.stat_experience || '3'}+</div>
                <div className="text-gray-400 text-xs">Years Exp.</div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <div>
              <div className="section-tag">
                <span className="w-4 h-0.5 bg-primary inline-block" />
                About Me
              </div>
              <h2 className="section-title">
                {profile?.about_title?.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-gradient">{profile?.about_title?.split(' ').slice(-1)[0]}</span>
              </h2>
            </div>

            <p className="text-gray-400 leading-relaxed">
              {profile?.about_text || 'Seorang Full Stack Developer yang bersemangat dalam membangun solusi digital inovatif.'}
            </p>

            {/* Highlights */}
            <ul className="space-y-3">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-400">
              {[
                { value: profile?.stat_projects, label: 'Project Complete', suffix: '+' },
                { value: profile?.stat_clients, label: 'Clients Served', suffix: '+' },
                { value: profile?.stat_experience, label: 'Year of Experience', suffix: '+' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-primary font-black text-2xl">{s.value || 0}{s.suffix}</div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <a href="#projects" className="btn-primary inline-flex items-center gap-2 group">
              View My Work
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
