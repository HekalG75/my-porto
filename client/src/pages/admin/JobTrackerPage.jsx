import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader, ExternalLink, Building2, Calendar, StickyNote, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Rejected'];

const STATUS_CONFIG = {
  Applied:     { color: 'bg-blue-500',   textColor: 'text-blue-400',   badgeClass: 'badge-status-applied',     label: 'Applied' },
  Interviewing:{ color: 'bg-yellow-500', textColor: 'text-yellow-400', badgeClass: 'badge-status-interviewing', label: 'Interviewing' },
  Offered:     { color: 'bg-green-500',  textColor: 'text-green-400',  badgeClass: 'badge-status-offered',      label: 'Offered 🎉' },
  Rejected:    { color: 'bg-red-500',    textColor: 'text-red-400',    badgeClass: 'badge-status-rejected',     label: 'Rejected' },
};

const EMPTY_FORM = { company_name: '', job_title: '', status: 'Applied', applied_date: new Date().toISOString().slice(0, 10), notes: '', job_url: '', salary_range: '' };

function KanbanCard({ job, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="bg-dark-300 border border-dark-400 rounded-xl p-4 hover:border-primary/20 transition-all group cursor-default">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="text-white font-semibold text-sm leading-snug">{job.job_title}</h4>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
            <Building2 size={11} className="text-primary" />
            {job.company_name}
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(job)} className="w-6 h-6 bg-dark-400 rounded flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
            <Pencil size={11} />
          </button>
          <button onClick={() => onDelete(job.id)} className="w-6 h-6 bg-dark-400 rounded flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {job.salary_range && (
        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
          <DollarSign size={11} className="text-primary" />
          {job.salary_range}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
        <Calendar size={11} />
        {new Date(job.applied_date).toLocaleDateString('id-ID')}
      </div>

      {job.notes && (
        <div className="bg-dark-400/50 rounded-lg p-2 mb-3">
          <p className="text-gray-400 text-xs line-clamp-2">{job.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value)}
          className="text-xs bg-dark-400 border border-dark-500 rounded-lg px-2 py-1 text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ status, jobs, onEdit, onDelete, onStatusChange }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex-1 min-w-[260px] bg-dark-200 border border-dark-400 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
          <h3 className={`font-semibold text-sm ${cfg.textColor}`}>{cfg.label}</h3>
        </div>
        <span className="bg-dark-300 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">{jobs.length}</span>
      </div>
      <div className="space-y-3 min-h-[100px]">
        {jobs.map((job) => (
          <KanbanCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
        ))}
        {jobs.length === 0 && (
          <div className="text-center py-6 text-gray-600 text-xs">Tidak ada lamaran</div>
        )}
      </div>
    </div>
  );
}

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('kanban'); // 'kanban' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null); // null = semua
  const ITEMS_PER_PAGE = 10;

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/admin/jobs'), api.get('/admin/jobs/stats')])
      .then(([jobs, stats]) => { setJobs(jobs.data.data); setStats(stats.data.data); setCurrentPage(1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal(true); };
  const openEdit = (j) => {
    setForm({ company_name: j.company_name, job_title: j.job_title, status: j.status, applied_date: j.applied_date?.slice(0, 10) || '', notes: j.notes || '', job_url: j.job_url || '', salary_range: j.salary_range || '' });
    setEditItem(j); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await api.put(`/admin/jobs/${editItem.id}`, form); toast.success('Lamaran diperbarui!'); }
      else { await api.post('/admin/jobs', form); toast.success('Lamaran ditambahkan!'); }
      setModal(false); fetchData();
    } catch { toast.error('Gagal menyimpan.'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus lamaran ini?')) return;
    try { await api.delete(`/admin/jobs/${id}`); toast.success('Dihapus!'); fetchData(); }
    catch { toast.error('Gagal menghapus.'); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/jobs/${id}/status`, { status: newStatus });
      fetchData();
    } catch { toast.error('Gagal update status.'); }
  };

  const jobsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = jobs.filter(j => j.status === s);
    return acc;
  }, {});

  const filteredJobs = statusFilter ? jobs.filter(j => j.status === statusFilter) : jobs;

  const handleStatCardClick = (status) => {
    if (statusFilter === status) {
      // Klik status yang sama → reset filter
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
    }
    setView('table');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Application Tracker</h1>
          <p className="text-gray-400 text-sm">Pantau status semua lamaran kerja Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-200 border border-dark-400 rounded-xl p-1">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'kanban' ? 'bg-primary text-dark-100' : 'text-gray-400 hover:text-white'}`}>Kanban</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'table' ? 'bg-primary text-dark-100' : 'text-gray-400 hover:text-white'}`}>Tabel</button>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2" id="add-job-btn">
            <Plus size={16} /> Tambah Lamaran
          </button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => handleStatCardClick(s)}
                className={`bg-dark-200 border rounded-xl p-4 flex items-center gap-3 w-full text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isActive
                    ? `border-current ${cfg.textColor} shadow-md ring-1 ring-inset ring-current/30`
                    : 'border-dark-400 hover:border-dark-300'
                }`}
              >
                <div className={`w-2 h-10 rounded-full ${cfg.color} ${isActive ? 'scale-110' : ''} transition-transform`} />
                <div>
                  <div className={`text-2xl font-black ${cfg.textColor}`}>{stats[s.toLowerCase()] ?? 0}</div>
                  <div className={`text-xs font-medium ${isActive ? cfg.textColor : 'text-gray-500'}`}>{s}</div>
                </div>
                {isActive && (
                  <div className={`ml-auto text-xs ${cfg.textColor} font-semibold`}>Aktif ✓</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader size={32} className="text-primary animate-spin" /></div>
      ) : view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(s => (
            <KanbanColumn key={s} status={s} jobs={jobsByStatus[s]} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
          {/* Filter info bar */}
          {statusFilter && (
            <div className={`flex items-center justify-between px-5 py-3 border-b border-dark-400 bg-dark-300/40`}>
              <span className="text-sm text-gray-300">
                Filter aktif: <span className={`font-semibold ${STATUS_CONFIG[statusFilter]?.textColor}`}>{statusFilter}</span>
                <span className="text-gray-500 ml-2">({filteredJobs.length} lamaran)</span>
              </span>
              <button
                onClick={() => { setStatusFilter(null); setCurrentPage(1); }}
                className="text-xs text-gray-400 hover:text-white border border-dark-400 hover:border-primary/40 px-3 py-1 rounded-lg transition-all"
              >
                ✕ Tampilkan Semua
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-400">
                <th className="px-5 py-3.5 text-left text-gray-400 font-medium">Perusahaan</th>
                <th className="px-5 py-3.5 text-left text-gray-400 font-medium">Posisi</th>
                <th className="px-5 py-3.5 text-left text-gray-400 font-medium hidden md:table-cell">Status</th>
                <th className="px-5 py-3.5 text-left text-gray-400 font-medium hidden md:table-cell">Tanggal</th>
                <th className="px-5 py-3.5 text-right text-gray-400 font-medium">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-dark-400">
                {(() => {
                  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
                  const paginated = filteredJobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                  return paginated;
                })().map(j => (
                  <tr key={j.id} className="hover:bg-dark-300/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-white font-semibold">{j.company_name}</div>
                      {j.salary_range && <div className="text-gray-500 text-xs">{j.salary_range}</div>}
                    </td>
                    <td className="px-5 py-4 text-gray-300">{j.job_title}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`badge ${STATUS_CONFIG[j.status]?.badgeClass}`}>{j.status}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-xs">{new Date(j.applied_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(j)} className="w-8 h-8 bg-dark-300 border border-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(j.id)} className="w-8 h-8 bg-dark-300 border border-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && <tr><td colSpan={5} className="text-center text-gray-500 py-12">Tidak ada lamaran dengan status <span className="font-semibold">{statusFilter}</span>.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-dark-400">
              <span className="text-gray-500 text-xs">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} dari {filteredJobs.length} lamaran
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-dark-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      page === currentPage
                        ? 'bg-primary text-dark-100'
                        : 'border border-dark-400 text-gray-400 hover:text-white hover:border-primary/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)))}
                  disabled={currentPage === Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)}
                  className="w-8 h-8 rounded-lg border border-dark-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-400 sticky top-0 bg-dark-200 z-10">
              <h2 className="text-white font-bold">{editItem ? 'Edit Lamaran' : 'Tambah Lamaran'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" id="job-form">
              <div>
                <label className="label">Nama Perusahaan *</label>
                <input className="input" value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} required placeholder="Google, Meta, Tokopedia..." />
              </div>
              <div>
                <label className="label">Posisi yang Dilamar *</label>
                <input className="input" value={form.job_title} onChange={(e) => setForm({...form, job_title: e.target.value})} required placeholder="Frontend Developer, Full Stack..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tanggal Melamar *</label>
                  <input type="date" className="input" value={form.applied_date} onChange={(e) => setForm({...form, applied_date: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Range Gaji</label>
                  <input className="input" value={form.salary_range} onChange={(e) => setForm({...form, salary_range: e.target.value})} placeholder="Rp 10-15jt..." />
                </div>
                <div>
                  <label className="label">URL Lowongan</label>
                  <input className="input" value={form.job_url} onChange={(e) => setForm({...form, job_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea className="input min-h-[80px] resize-y" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Catatan khusus tentang lamaran ini..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader size={16} className="animate-spin" />}
                  {saving ? 'Menyimpan...' : (editItem ? 'Simpan' : 'Tambah')}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
