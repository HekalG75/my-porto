import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Loader, ExternalLink, Award, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PdfPreview from '../../components/public/PdfPreview';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const EMPTY_FORM = { title: '', issuer: '', issue_date: '', credential_url: '' };

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCerts = () => {
    setLoading(true);
    api.get('/certificates').then(({ data }) => setCerts(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCerts(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setImageFile(null); setImagePreview(null); setModal(true); };
  const openEdit = (c) => {
    setForm({ title: c.title, issuer: c.issuer, issue_date: c.issue_date?.slice(0, 10) || '', credential_url: c.credential_url || '' });
    setEditItem(c);
    setImagePreview(c.image_url ? `${API_URL}${c.image_url}` : null);
    setImageFile(null);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) {
        await api.put(`/certificates/admin/${editItem.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Sertifikat diperbarui!');
      } else {
        await api.post('/certificates/admin', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Sertifikat ditambahkan!');
      }
      setModal(false); fetchCerts();
    } catch { toast.error('Gagal menyimpan.'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    try { await api.delete(`/certificates/admin/${id}`); toast.success('Dihapus!'); fetchCerts(); }
    catch { toast.error('Gagal menghapus.'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Sertifikat</h1>
          <p className="text-gray-400 text-sm">{certs.length} sertifikat terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2" id="add-cert-btn">
          <Plus size={18} /> Tambah Sertifikat
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader size={32} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((c) => (
            <div key={c.id} className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
              <div className="h-36 bg-dark-300 relative overflow-hidden">
                {c.image_url ? (
                  c.image_url.toLowerCase().endsWith('.pdf') ? (
                    <PdfPreview url={`${API_URL}${c.image_url}`} className="w-full h-full" />
                  ) : (
                    <img src={`${API_URL}${c.image_url}`} alt={c.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Award size={36} className="text-primary/30" /></div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{c.title}</h3>
                <p className="text-gray-400 text-xs mb-1">{c.issuer}</p>
                <p className="text-gray-500 text-xs mb-3">{formatDate(c.issue_date)}</p>
                <div className="flex items-center gap-2">
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline">
                      <ExternalLink size={12} /> Credential
                    </a>
                  )}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => openEdit(c)} className="w-7 h-7 bg-dark-300 border border-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-7 h-7 bg-dark-300 border border-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {certs.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-500">
              <Award size={40} className="mx-auto mb-4 opacity-30" />
              <p>Belum ada sertifikat. Klik "Tambah Sertifikat".</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-400">
              <h2 className="text-white font-bold">{editItem ? 'Edit Sertifikat' : 'Tambah Sertifikat'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-dark-400 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => document.getElementById('cert-img-input').click()}>
                {imagePreview ? (
                  ((imageFile && imageFile.type === 'application/pdf') || (typeof imagePreview === 'string' && imagePreview.toLowerCase().endsWith('.pdf'))) ? (
                    <PdfPreview url={imagePreview} className="w-20 h-14 object-cover rounded" />
                  ) : (
                    <img src={imagePreview} alt="preview" className="w-20 h-14 object-cover rounded" />
                  )
                ) : (
                  <div className="w-20 h-14 bg-dark-300 rounded flex items-center justify-center text-gray-500"><Upload size={20} /></div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">Upload Gambar atau PDF Sertifikat</p>
                  <p className="text-gray-500 text-xs">JPEG, PNG, PDF. Max 5MB</p>
                </div>
                <input id="cert-img-input" type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
              </div>
              <div>
                <label className="label">Judul Sertifikat *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required placeholder="AWS Certified Developer..." />
              </div>
              <div>
                <label className="label">Issuing Organization *</label>
                <input className="input" value={form.issuer} onChange={(e) => setForm({...form, issuer: e.target.value})} required placeholder="Amazon Web Services..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal Terbit</label>
                  <input type="date" className="input" value={form.issue_date} onChange={(e) => setForm({...form, issue_date: e.target.value})} />
                </div>
                <div>
                  <label className="label">URL Credential</label>
                  <input className="input" value={form.credential_url} onChange={(e) => setForm({...form, credential_url: e.target.value})} placeholder="https://..." />
                </div>
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
