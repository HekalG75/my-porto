import { useEffect, useState } from 'react';
import { ExternalLink, GitFork, Filter, X } from 'lucide-react';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';


const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [active, setActive] = useState('All');
  const [filtered, setFiltered] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data.data);
      setFiltered(data.data);
    }).catch(() => {});

    api.get('/projects/categories').then(({ data }) => {
      setCategories(['All', ...data.data.map(c => c.name)]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setFiltered(active === 'All' ? projects : projects.filter(p => p.category === active));
  }, [active, projects]);

  useEffect(() => {
    if (activeProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeProject]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section id="projects" className="py-20 bg-dark-DEFAULT relative grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-tag justify-center">
            <span className="w-4 h-0.5 bg-primary inline-block" />
            Portfolio
          </div>
          <h2 className="section-title">My Recent Projects</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Beberapa proyek terbaru yang saya kerjakan dengan passion dan dedikasi penuh.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                active === cat
                  ? 'bg-primary text-dark-100 shadow-lg shadow-primary/30'
                  : 'bg-dark-200 text-gray-400 hover:text-white border border-dark-400 hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const imgSrc = project.image_url ? `${API_URL}${project.image_url}` : null;
            const techList = project.tech_stack ? project.tech_stack.split(',').map(t => t.trim()) : [];

            return (
              <div key={project.id} onClick={() => setActiveProject(project)} className="group card overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                {/* Image */}
                <div className="relative h-48 bg-dark-300 overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-5xl">🖥️</div>
                    </div>
                  )}
                  {project.is_featured === 1 && (
                    <div className="absolute top-3 left-3 badge">⭐ Featured</div>
                  )}
                  {/* Overlay */}
                  <div onClick={(e) => e.stopPropagation()} className="absolute inset-0 bg-gradient-to-t from-dark-200/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 gap-2">
                    {project.project_url && (
                      <a href={project.project_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <ExternalLink size={16} className="text-dark-100" />
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 bg-dark-300 border border-dark-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <GitFork size={16} className="text-white" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-bold text-base leading-tight">{project.title}</h3>
                    <span className="text-xs text-gray-500 shrink-0 bg-dark-300 px-2 py-0.5 rounded-full">{project.category}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{stripHtml(project.description)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {techList.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-xs bg-dark-300 text-gray-300 px-2.5 py-1 rounded-full border border-dark-400">
                        {tech}
                      </span>
                    ))}
                    {techList.length > 4 && (
                      <span className="text-xs text-primary px-2 py-1">+{techList.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Filter size={40} className="mx-auto mb-4 opacity-30" />
            <p>Belum ada project {active !== 'All' ? `kategori "${active}"` : ''}.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Project */}
      {activeProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="bg-dark-200 border border-dark-400 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-4 right-4 bg-dark-300 hover:bg-dark-400 border border-dark-400 hover:border-primary/50 text-gray-400 hover:text-white rounded-full p-2 transition-all duration-200 z-20"
            >
              <X size={20} />
            </button>

            {/* Cover Image */}
            <div className="relative h-64 sm:h-80 bg-dark-300 overflow-hidden border-b border-dark-400">
              {activeProject.image_url ? (
                <img
                  src={`${API_URL}${activeProject.image_url}`}
                  alt={activeProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-300">
                  <span className="text-7xl">🖥️</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="badge mb-2">{activeProject.category}</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
                  {activeProject.title}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Tech Stack & Links */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-400">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Tech Stack</span>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.tech_stack ? (
                      activeProject.tech_stack.split(',').map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-dark-300 text-gray-300 px-3 py-1.5 rounded-full border border-dark-400 font-medium"
                        >
                          {tech.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {activeProject.project_url && (
                    <a
                      href={activeProject.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-2 font-semibold shadow-lg shadow-primary/20"
                    >
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  )}
                  {activeProject.github_url && (
                    <a
                      href={activeProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 font-semibold"
                    >
                      <GitFork size={16} /> Repository
                    </a>
                  )}
                </div>
              </div>

              {/* Rich Description */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Tentang Projek</span>
                <div
                  className="project-rich-content"
                  dangerouslySetInnerHTML={{ __html: activeProject.description }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
