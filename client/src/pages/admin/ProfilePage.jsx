import { useEffect, useState } from 'react';
import { Save, Upload, Loader, User, BarChart3, Lock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ProfilePage() {
  const [form, setForm] = useState({
    hero_greeting: '', hero_title: '', hero_subtitle: '',
    cta_primary_text: '', cta_primary_url: '', cta_secondary_text: '', cta_secondary_url: '',
    stat_projects: '', stat_experience: '', stat_clients: '',
    about_title: '', about_text: '',
    github_url: '', linkedin_url: '', skills_marquee: '',
    email: '',
  });
  const [profileImg, setProfileImg] = useState(null);
  const [aboutImg, setAboutImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      const d = data.data;
      setForm({
        hero_greeting: d.hero_greeting || '',
        hero_title: d.hero_title || '',
        hero_subtitle: d.hero_subtitle || '',
        cta_primary_text: d.cta_primary_text || '',
        cta_primary_url: d.cta_primary_url || '',
        cta_secondary_text: d.cta_secondary_text || '',
        cta_secondary_url: d.cta_secondary_url || '',
        stat_projects: d.stat_projects || '',
        stat_experience: d.stat_experience || '',
        stat_clients: d.stat_clients || '',
        about_title: d.about_title || '',
        about_text: d.about_text || '',
        github_url: d.github_url || '',
        linkedin_url: d.linkedin_url || '',
        skills_marquee: d.skills_marquee || '',
        email: d.email || '',
      });
      setProfileImg(d.profile_image_url ? `${API_URL}${d.profile_image_url}` : null);
      setAboutImg(d.about_image_url ? `${API_URL}${d.about_image_url}` : null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile/admin', form);
      toast.success('Profil berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok!');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password baru minimal harus 6 karakter!');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success('Password berhasil diubah!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePhotoUpload = async (file, type) => {
    if (!file) return;
    const endpoint = type === 'profile' ? '/profile/admin/upload-photo' : '/profile/admin/upload-about-photo';
    setUploadingProfile(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (type === 'profile') setProfileImg(`${API_URL}${data.imageUrl}`);
      else setAboutImg(`${API_URL}${data.imageUrl}`);
      toast.success('Foto berhasil diupload!');
    } catch {
      toast.error('Gagal upload foto.');
    } finally {
      setUploadingProfile(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size={32} className="text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Manajemen Profil</h1>
        <p className="text-gray-400 text-sm">Kelola konten hero section dan statistik portfolio</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6" id="profile-form">
        {/* Photos */}
        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-bold flex items-center gap-2"><User size={18} className="text-primary" /> Foto</h2>
          <PhotoUploader label="Foto Profil (Hero)" currentImg={profileImg} type="profile" icon={<User size={24} className="text-gray-500" />} onUpload={handlePhotoUpload} />
          <PhotoUploader label="Foto About Section" currentImg={aboutImg} type="about" icon={<User size={24} className="text-gray-500" />} onUpload={handlePhotoUpload} />
        </div>

        {/* Hero Content */}
        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold">Konten Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Greeting" id="hero-greeting" placeholder="Hello There! 👋" value={form.hero_greeting} onChange={(e) => setForm({...form, hero_greeting: e.target.value})} />
            <InputField label="Job Title" id="hero-title" placeholder="Full Stack Developer..." value={form.hero_title} onChange={(e) => setForm({...form, hero_title: e.target.value})} />
          </div>
          <div>
            <label htmlFor="hero-subtitle" className="label">Subtitle / Deskripsi</label>
            <textarea id="hero-subtitle" className="input min-h-[80px] resize-y" placeholder="Deskripsi singkat tentang Anda..." value={form.hero_subtitle} onChange={(e) => setForm({...form, hero_subtitle: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="CTA Primary Text" id="cta-primary-text" value={form.cta_primary_text} onChange={(e) => setForm({...form, cta_primary_text: e.target.value})} />
            <InputField label="CTA Primary URL" id="cta-primary-url" value={form.cta_primary_url} onChange={(e) => setForm({...form, cta_primary_url: e.target.value})} />
            <InputField label="CTA Secondary Text" id="cta-secondary-text" value={form.cta_secondary_text} onChange={(e) => setForm({...form, cta_secondary_text: e.target.value})} />
            <InputField label="CTA Secondary URL" id="cta-secondary-url" value={form.cta_secondary_url} onChange={(e) => setForm({...form, cta_secondary_url: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dark-400/20 pt-4 mt-4">
            <InputField label="Email Kontak & Login" id="email" type="email" placeholder="admin@portfolio.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <InputField label="GitHub URL" id="github-url" placeholder="https://github.com/username" value={form.github_url} onChange={(e) => setForm({...form, github_url: e.target.value})} />
            <InputField label="LinkedIn URL" id="linkedin-url" placeholder="https://linkedin.com/in/username" value={form.linkedin_url} onChange={(e) => setForm({...form, linkedin_url: e.target.value})} />
          </div>
          <div className="mt-4 border-t border-dark-400/20 pt-4">
            <InputField label="Running Text / Keahlian (Marquee - pisahkan dengan koma)" id="skills-marquee" placeholder="App Design, Web Design, UI/UX..." value={form.skills_marquee} onChange={(e) => setForm({...form, skills_marquee: e.target.value})} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Statistik</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Total Projects" id="stat-projects" type="number" value={form.stat_projects} onChange={(e) => setForm({...form, stat_projects: e.target.value})} />
            <InputField label="Tahun Pengalaman" id="stat-experience" type="number" value={form.stat_experience} onChange={(e) => setForm({...form, stat_experience: e.target.value})} />
            <InputField label="Total Clients" id="stat-clients" type="number" value={form.stat_clients} onChange={(e) => setForm({...form, stat_clients: e.target.value})} />
          </div>
        </div>

        {/* About */}
        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold">Konten About</h2>
          <InputField label="Judul About" id="about-title" value={form.about_title} onChange={(e) => setForm({...form, about_title: e.target.value})} />
          <div>
            <label htmlFor="about-text" className="label">Teks About</label>
            <textarea id="about-text" className="input min-h-[100px] resize-y" value={form.about_text} onChange={(e) => setForm({...form, about_text: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2" id="save-profile-btn">
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handlePasswordChange} className="bg-dark-200 border border-dark-400 rounded-2xl p-6 space-y-4" id="change-password-form">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Lock size={18} className="text-primary" /> Ubah Password
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField 
            label="Password Saat Ini" 
            id="current-password" 
            type="password" 
            placeholder="••••••••" 
            value={passForm.currentPassword} 
            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} 
            required 
          />
          <InputField 
            label="Password Baru" 
            id="new-password" 
            type="password" 
            placeholder="••••••••" 
            value={passForm.newPassword} 
            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} 
            required 
          />
          <InputField 
            label="Konfirmasi Password Baru" 
            id="confirm-password" 
            type="password" 
            placeholder="••••••••" 
            value={passForm.confirmPassword} 
            onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} 
            required 
          />
        </div>
        <button type="submit" disabled={passwordSaving} className="btn-primary flex items-center gap-2" id="change-password-btn">
          {passwordSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {passwordSaving ? 'Mengubah...' : 'Ubah Password'}
        </button>
      </form>
    </div>
  );
}

const InputField = ({ label, id, type = 'text', ...props }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    <input id={id} type={type} className="input" {...props} />
  </div>
);

const PhotoUploader = ({ label, currentImg, type, icon, onUpload }) => (
  <div className="flex items-center gap-5">
    <div className="w-20 h-20 rounded-full bg-dark-300 border-2 border-dashed border-dark-400 overflow-hidden flex items-center justify-center shrink-0">
      {currentImg ? (
        <img src={currentImg} alt={label} className="w-full h-full object-cover" />
      ) : icon}
    </div>
    <div>
      <p className="text-white text-sm font-semibold">{label}</p>
      <p className="text-gray-400 text-xs mb-2">JPEG, PNG, WEBP. Max 5MB</p>
      <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5 w-fit">
        <Upload size={13} />
        Upload Foto
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files[0], type)} />
      </label>
    </div>
  </div>
);

