import { useEffect, useRef, useState } from 'react';
import { Briefcase, Clock, Users, Award } from 'lucide-react';
import api from '../../services/api';

function CountUp({ target, suffix = '+', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    hasStarted.current = false;
    setCount(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsSection() {
  const [profile, setProfile] = useState(null);
  const [certsCount, setCertsCount] = useState(15);
  const [projectsCount, setProjectsCount] = useState(50);

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile(data.data)).catch(() => {});
    api.get('/certificates').then(({ data }) => setCertsCount(data.data.length)).catch(() => {});
    api.get('/projects').then(({ data }) => setProjectsCount(data.data.length)).catch(() => {});
  }, []);

  const stats = [
    {
      icon: <Briefcase size={28} />,
      value: projectsCount,
      label: 'Projects Completed',
      suffix: '+',
    },
    {
      icon: <Clock size={28} />,
      value: profile?.stat_experience || 3,
      label: 'Years of Experience',
      suffix: '+',
    },
    {
      icon: <Users size={28} />,
      value: profile?.stat_clients || 20,
      label: 'Happy Clients',
      suffix: '+',
    },
    {
      icon: <Award size={28} />,
      value: certsCount,
      label: 'Certifications',
      suffix: '+',
    },
  ];

  const marqueeItems = profile?.skills_marquee
    ? profile.skills_marquee.split(',').map(item => item.trim())
    : ['App Design', 'Wireframes', 'Web Design', 'Dashboard', 'Logo Design', 'UI/UX Design', 'Backend API', 'Database Design'];

  const repeatedItems = [...Array(4)].flatMap(() => marqueeItems);

  return (
    <section className="py-8 bg-primary relative overflow-hidden">
      {/* Moving ticker */}
      <div className="flex overflow-hidden select-none w-full">
        {/* Track 1 */}
        <div className="flex shrink-0 min-w-full justify-around gap-8 animate-[marquee_35s_linear_infinite]">
          {repeatedItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap text-dark-100 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-dark-100/40 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
        {/* Track 2 (Identical duplicate for seamless looping) */}
        <div className="flex shrink-0 min-w-full justify-around gap-8 animate-[marquee_35s_linear_infinite]" aria-hidden="true">
          {repeatedItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap text-dark-100 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-dark-100/40 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* Stats below ticker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="text-center bg-dark-100/10 rounded-2xl p-6 backdrop-blur-sm border border-dark-100/10 hover:bg-dark-100/20 transition-all duration-300"
          >
            <div className="text-dark-100 mb-3 flex justify-center opacity-80">{stat.icon}</div>
            <div className="text-3xl sm:text-4xl font-black text-dark-100">
              <CountUp target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-dark-100/70 text-sm mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
