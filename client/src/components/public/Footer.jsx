import { useEffect, useState } from 'react';
import { Code2, GitFork, X, Mail, Heart, Link } from 'lucide-react';
import api from '../../services/api';

export default function Footer() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => setProfile(data.data))
      .catch(() => { });
  }, []);

  const socials = [
    { icon: <GitFork size={18} />, href: profile?.github_url || 'https://github.com/hekalg75', label: 'GitHub' },
    { icon: <Link size={18} />, href: profile?.linkedin_url || 'https://www.linkedin.com/in/haikal26/', label: 'LinkedIn' },
    { icon: <Mail size={18} />, href: profile?.email ? `mailto:${profile.email}` : 'mailto:haikalmuhamad024@gmail.com', label: 'Email' },
  ];

  return (
    <footer className="bg-dark-100 border-t border-dark-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 size={18} className="text-dark-100" />
            </div>
            <span className="font-bold text-white">Portfolio</span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 bg-dark-300 border border-dark-400 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm flex items-center gap-1">
            © {new Date().getFullYear()} Portfolio. Made with <Heart size={14} className="text-red-500 fill-red-500" /> Hekal
          </p>
        </div>
      </div>
    </footer>
  );
}
