import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Loader, Star, ExternalLink, GitFork, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const EMPTY_FORM = { title: '', description: '', tech_stack: '', project_url: '', github_url: '', category: 'Web', is_featured: 0 };

const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};


const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'blockquote', 'code-block',
  'list', 'bullet',
  'link', 'image'
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects').then(({ data }) => {
      setProjects(data.data);
      setCurrentPage(1);
    }).finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    api.get('/projects/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  };

  useEffect(() => { 
    fetchProjects(); 
    fetchCategories();
  }, []);

  const openAdd = () => { 
    setForm({ ...EMPTY_FORM, category: categories[0]?.name || 'Web' }); 
    setEditItem(null); 
    setImageFile(null); 
    setImagePreview(null); 
    setModal(true); 
  };
  const openEdit = (p) => {
    setForm({ title: p.title, description: p.description || '', tech_stack: p.tech_stack || '', project_url: p.project_url || '', github_url: p.github_url || '', category: p.category || (categories[0]?.name || 'Web'), is_featured: p.is_featured });
    setEditItem(p);
    setImagePreview(p.image_url ? `${API_URL}${p.image_url}` : null);
    setImageFile(null);
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditItem(null); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editItem) {
        await api.put(`/projects/admin/${editItem.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Project berhasil diperbarui!');
      } else {
        await api.post('/projects/admin', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Project berhasil ditambahkan!');
      }
      closeModal(); fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan project.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus project ini?')) return;
    try {
      await api.delete(`/projects/admin/${id}`);
      toast.success('Project dihapus!');
      fetchProjects();
    } catch { toast.error('Gagal menghapus.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Projects</h1>
          <p className="text-gray-400 text-sm">{projects.length} project terdaftar</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCategoryModal(true)} className="btn-secondary flex items-center gap-2" id="manage-cats-btn">
            Kelola Kategori
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2" id="add-project-btn">
            <Plus size={18} /> Tambah Project
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader size={32} className="text-primary animate-spin" /></div>
      ) : (() => {
        const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
        const paginated = projects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        return (
          <div className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-400">
                    <th className="px-5 py-3.5 text-left text-gray-400 font-medium">Project</th>
                    <th className="px-5 py-3.5 text-left text-gray-400 font-medium hidden md:table-cell">Kategori</th>
                    <th className="px-5 py-3.5 text-left text-gray-400 font-medium hidden lg:table-cell">Tech Stack</th>
                    <th className="px-5 py-3.5 text-left text-gray-400 font-medium hidden sm:table-cell">Featured</th>
                    <th className="px-5 py-3.5 text-right text-gray-400 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-400">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-dark-300/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-dark-300 rounded-lg overflow-hidden shrink-0">
                            {p.image_url ? <img src={`${API_URL}${p.image_url}`} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🖥️</div>}
                          </div>
                          <div>
                            <div className="text-white font-semibold truncate max-w-[140px]">{p.title}</div>
                            <div className="text-gray-500 text-xs truncate max-w-[140px]">{stripHtml(p.description)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="badge">{p.category}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-gray-400">{p.tech_stack}</td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        {p.is_featured ? <Star size={16} className="text-primary" fill="currentColor" /> : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 bg-dark-300 border border-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="w-8 h-8 bg-dark-300 border border-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-gray-500 py-12">Belum ada project. Klik "Tambah Project" untuk memulai.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-dark-400">
                <span className="text-gray-500 text-xs">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, projects.length)} dari {projects.length} project
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg border border-dark-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg border border-dark-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-400 sticky top-0 bg-dark-200 z-10">
              <h2 className="text-white font-bold text-lg">{editItem ? 'Edit Project' : 'Tambah Project'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" id="project-form">
              {/* Image upload */}
              <div>
                <label className="label">Gambar Project</label>
                <div className="border-2 border-dashed border-dark-400 rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => document.getElementById('proj-img-input').click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-20 h-14 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-14 bg-dark-300 rounded-lg flex items-center justify-center text-gray-500"><Upload size={20} /></div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">Klik untuk upload gambar</p>
                    <p className="text-gray-500 text-xs">JPEG, PNG. Max 5MB</p>
                  </div>
                  <input id="proj-img-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Judul Project *</label>
                  <input className="input" placeholder="Nama project..." value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Deskripsi</label>
                  <div className="quill-wrapper">
                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      formats={formats}
                      placeholder="Tulis deskripsi project yang mendalam di sini..."
                      value={form.description}
                      onChange={(value) => setForm({...form, description: value})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Tech Stack (pisah dengan koma)</label>
                  <input className="input" placeholder="React, Node.js, MySQL..." value={form.tech_stack} onChange={(e) => setForm({...form, tech_stack: e.target.value})} />
                </div>
                <div>
                  <label className="label">Link Project</label>
                  <input className="input" placeholder="https://..." value={form.project_url} onChange={(e) => setForm({...form, project_url: e.target.value})} />
                </div>
                <div>
                  <label className="label">Link GitHub</label>
                  <input className="input" placeholder="https://github.com/..." value={form.github_url} onChange={(e) => setForm({...form, github_url: e.target.value})} />
                </div>
                <div>
                  <label className="label">Kategori</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input id="is-featured" type="checkbox" className="w-4 h-4 accent-primary" checked={form.is_featured === 1} onChange={(e) => setForm({...form, is_featured: e.target.checked ? 1 : 0})} />
                  <label htmlFor="is-featured" className="text-gray-300 text-sm cursor-pointer">Featured Project ⭐</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader size={16} className="animate-spin" /> : null}
                  {saving ? 'Menyimpan...' : (editItem ? 'Simpan Perubahan' : 'Tambah Project')}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-400 sticky top-0 bg-dark-200 z-10">
              <h2 className="text-white font-bold text-lg">Kelola Kategori Proyek</h2>
              <button onClick={() => setCategoryModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Add Category Form */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newCategoryName.trim()) return;
                setCategorySaving(true);
                try {
                  await api.post('/projects/categories/admin', { name: newCategoryName });
                  toast.success('Kategori berhasil ditambahkan!');
                  setNewCategoryName('');
                  fetchCategories();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Gagal menambahkan kategori.');
                } finally {
                  setCategorySaving(false);
                }
              }} className="flex gap-2">
                <input
                  className="input py-2 text-sm"
                  placeholder="Nama kategori baru..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
                <button type="submit" disabled={categorySaving} className="btn-primary py-2 px-4 text-sm font-semibold shrink-0 flex items-center gap-1">
                  {categorySaving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />} Tambah
                </button>
              </form>

              {/* Categories List */}
              <div className="space-y-2">
                <label className="label">Daftar Kategori Aktif</label>
                <div className="divide-y divide-dark-400 border border-dark-400 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-dark-300/30 hover:bg-dark-300/60 transition-colors">
                      <span className="text-white text-sm font-medium">{c.name}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Hapus kategori "${c.name}"?`)) return;
                          try {
                            await api.delete(`/projects/categories/admin/${c.id}`);
                            toast.success('Kategori berhasil dihapus!');
                            fetchCategories();
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Gagal menghapus kategori.');
                          }
                        }}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        title="Hapus Kategori"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">Belum ada kategori.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
