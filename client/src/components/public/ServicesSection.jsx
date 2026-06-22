import { useEffect, useState } from 'react';
import { ArrowRight, Globe, Palette, Smartphone, Server, Database, Cloud, Code, Layers } from 'lucide-react';
import api from '../../services/api';

const iconMap = {
  Globe, Palette, Smartphone, Server, Database, Cloud, Code, Layers,
};

export default function ServicesSection() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.data)).catch(() => {});
  }, []);

  return (
    <section id="services" className="py-20 bg-dark-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-tag">
              <span className="w-4 h-0.5 bg-primary inline-block" />
              Service
            </div>
            <h2 className="section-title">Delivering Value Through Our Services</h2>
          </div>
          <a href="#contact" className="text-primary text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-200 shrink-0">
            View All Services <ArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon_name] || Code;
            return (
              <div
                key={service.id}
                className="card-hover group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon size={22} className="text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-white font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{service.description}</p>

                {/* Read more */}
                <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all duration-200">
                  Read More <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {services.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Code size={40} className="mx-auto mb-4 opacity-30" />
            <p>Belum ada layanan. Tambahkan melalui Admin Panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
