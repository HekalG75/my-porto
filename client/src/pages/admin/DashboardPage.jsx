import { useEffect, useState } from 'react';
import { FolderKanban, Award, Briefcase, ExternalLink, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [jobStats, setJobStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/certificates'),
      api.get('/admin/jobs/stats'),
      api.get('/admin/jobs'),
    ]).then(([proj, cert, jobs, recentJobs]) => {
      setStats({
        projects: proj.data.data.length,
        certificates: cert.data.data.length,
      });
      setJobStats(jobs.data.data);
      setRecentProjects(proj.data.data.slice(0, 3));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Projects', value: stats?.projects ?? '—', icon: <FolderKanban size={22} />, color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
    { label: 'Certificates', value: stats?.certificates ?? '—', icon: <Award size={22} />, color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
    { label: 'Job Applications', value: jobStats?.total ?? '—', icon: <Briefcase size={22} />, color: 'bg-primary/10 text-primary', border: 'border-primary/20' },
    { label: 'Offers Received', value: jobStats?.offered ?? '—', icon: <TrendingUp size={22} />, color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
  ];

  const jobStatusData = [
    { label: 'Applied', value: jobStats?.applied, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Interviewing', value: jobStats?.interviewing, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    { label: 'Offered', value: jobStats?.offered, color: 'bg-green-500', textColor: 'text-green-400' },
    { label: 'Rejected', value: jobStats?.rejected, color: 'bg-red-500', textColor: 'text-red-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Ringkasan aktivitas portfolio Anda</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`bg-dark-200 border ${c.border} rounded-2xl p-5`}>
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              {c.icon}
            </div>
            <div className="text-2xl font-black text-white">{c.value}</div>
            <div className="text-gray-400 text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Job status breakdown */}
        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-5">Status Lamaran Kerja</h2>
          <div className="space-y-3">
            {jobStatusData.map((s) => {
              const pct = jobStats?.total > 0 ? Math.round((s.value / jobStats.total) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${s.textColor}`}>{s.label}</span>
                    <span className="text-gray-400">{s.value ?? 0}</span>
                  </div>
                  <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent projects */}
        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold">Project Terbaru</h2>
            <a href="/admin/projects" className="text-primary text-xs font-semibold hover:underline">Lihat Semua</a>
          </div>
          <div className="space-y-3">
            {recentProjects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl hover:bg-dark-400/50 transition-colors">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-lg flex-shrink-0">
                  🖥️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{p.title}</div>
                  <div className="text-gray-500 text-xs truncate">{p.tech_stack}</div>
                </div>
                {p.project_url && (
                  <a href={p.project_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors shrink-0">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada project</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
