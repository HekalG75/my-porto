import { useEffect, useState } from 'react';
import { Play, Download, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function HeroSection() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => setProfile(data.data))
      .catch(() => setProfile({
        hero_greeting: 'Hello There! 👋',
        hero_title: 'Muhammad Haikal',
        hero_subtitle: 'Saya membangun aplikasi web modern yang scalable dan beautiful. Spesialis dalam React, Node.js, dan arsitektur cloud.',
        cta_primary_text: 'View My Portfolio',
        cta_primary_url: '#projects',
        cta_secondary_text: 'Hire Me',
        cta_secondary_url: '#about',
        profile_image_url: null,
      }))
      .finally(() => setTimeout(() => setLoaded(true), 100));
  }, []);

  const imgSrc = profile?.profile_image_url
    ? `${API_URL}${profile.profile_image_url}`
    : null;

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      {/* Hero glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      {/* Floating circles decoration */}
      <div className="absolute top-32 right-[15%] w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-primary/3 blur-2xl animate-pulse-slow animate-delay-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 lg:pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className={`space-y-6 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Greeting badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full">
              <Sparkles size={14} className="animate-pulse" />
              <span>{profile?.hero_greeting || 'Hello There! 👋'}</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-tight">
              {profile?.hero_title?.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="text-gradient">
                {profile?.hero_title?.split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              {profile?.hero_subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={profile?.cta_primary_url || '#projects'}
                className="btn-primary flex items-center gap-2 group"
                id="hero-cta-primary"
              >
                <Play size={16} className="group-hover:scale-110 transition-transform" />
                {profile?.cta_primary_text || 'View My Portfolio'}
              </a>
              <a
                href={profile?.cta_secondary_url || '#about'}
                className="btn-secondary flex items-center gap-2 group"
                id="hero-cta-secondary"
              >
                {profile?.cta_secondary_text || 'Hire Me'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={profile?.github_url || "https://github.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-dark-200 border border-dark-400 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-primary/10"
                aria-label="GitHub Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={profile?.linkedin_url || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-dark-200 border border-dark-400 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-primary/10"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Profile Image */}
          <div className={`flex justify-center lg:justify-end order-first lg:order-none transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Outer ring glow */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-110 animate-pulse-slow" />

              {/* Green circle background */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-end overflow-hidden animate-float">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt="Profile"
                    className="w-full h-full object-cover object-top rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-2">👨‍💻</div>
                      <p className="text-xs">Upload foto profil</p>
                      <p className="text-xs">di Admin Panel</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating badge: top right */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 animate-float animate-delay-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-semibold">Available to Work</span>
                </div>
              </div>

              {/* Floating badge: bottom left */}
              <div className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 animate-float animate-delay-400">
                <div className="text-center">
                  <div className="text-primary font-bold text-lg">{profile?.stat_projects || '50'}+</div>
                  <div className="text-gray-400 text-xs">Projects Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-5 h-8 border-2 border-dark-400 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
