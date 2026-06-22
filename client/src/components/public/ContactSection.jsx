import { useState, useEffect } from 'react';
import { Mail, Send, User, MessageSquare, BookOpen } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ContactSection() {
  const [email, setEmail] = useState('hello@portfolio.com');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    // Fetch email dynamically from profile
    api.get('/profile')
      .then(({ data }) => {
        if (data.data?.email) setEmail(data.data.email);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, subject, message } = formData;

    if (!name || !subject || !message) {
      toast.error('Semua kolom wajib diisi!');
      return;
    }

    // Build mailto link
    const mailtoSubject = encodeURIComponent(`[Portfolio] ${subject}`);
    const mailtoBody = encodeURIComponent(`Nama: ${name}\n\n${message}`);
    const mailtoUrl = `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Open email client
    window.location.href = mailtoUrl;
    toast.success('Membuka email client Anda...');
    
    // Clear form
    setFormData({ name: '', subject: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-dark-DEFAULT relative grid-bg border-t border-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-tag justify-center">
            <span className="w-4 h-0.5 bg-primary inline-block" />
            Hubungi Saya
          </div>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Punya proyek menarik atau sekadar ingin menyapa? Silakan kirimkan pesan Anda di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-8 bg-dark-200 border border-dark-400 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
              
              <h3 className="text-2xl font-bold text-white mb-4">Mari berkolaborasi membangun sesuatu yang hebat!</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Saya selalu terbuka untuk mendiskusikan proyek baru, ide kreatif, atau kesempatan untuk menjadi bagian dari visi Anda.
              </p>

              <div className="space-y-4">
                <a 
                  href={`mailto:${email}`} 
                  className="flex items-center gap-4 p-4 bg-dark-300/50 hover:bg-dark-300 border border-dark-400 hover:border-primary/30 rounded-2xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase font-semibold tracking-wider">Email Resmi</span>
                    <span className="text-white text-sm font-medium break-all">{email}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="card p-8 bg-dark-200 border border-dark-400 rounded-3xl space-y-5">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider block">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama Anda..."
                    className="input pl-10 py-3 text-sm focus:border-primary/50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider block">Subjek Pesan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <BookOpen size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Pekerjaan, kolaborasi, penawaran..."
                    className="input pl-10 py-3 text-sm focus:border-primary/50"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider block">Detail Pesan</label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-gray-500">
                    <MessageSquare size={16} />
                  </div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan pesan Anda secara mendetail di sini..."
                    className="input pl-10 py-3 text-sm min-h-[120px] resize-y focus:border-primary/50"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                <Send size={16} /> Kirim Pesan via Email
              </button>

            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
