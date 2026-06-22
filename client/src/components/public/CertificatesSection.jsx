import { useEffect, useState } from 'react';
import { ExternalLink, Calendar, Building2, Award, X, FileText } from 'lucide-react';
import api from '../../services/api';
import PdfPreview from './PdfPreview';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CertificatesSection() {
  const [certs, setCerts] = useState([]);
  const [activeCert, setActiveCert] = useState(null);

  useEffect(() => {
    api.get('/certificates').then(({ data }) => setCerts(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveCert(null);
    };
    if (activeCert) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeCert]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
  };

  return (
    <section id="certificates" className="py-20 bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-tag justify-center">
            <span className="w-4 h-0.5 bg-primary inline-block" />
            Achievements
          </div>
          <h2 className="section-title">Professional Certificates</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Sertifikasi profesional yang membuktikan kompetensi dan komitmen terhadap keahlian.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert, i) => {
            const imgSrc = cert.image_url ? `${API_URL}${cert.image_url}` : null;

            return (
              <div 
                key={cert.id} 
                className="card group hover:-translate-y-1 transition-all duration-300 overflow-hidden p-0 cursor-pointer"
                onClick={() => setActiveCert(cert)}
              >
                {/* Certificate image preview */}
                <div className="relative h-40 bg-gradient-to-br from-dark-300 to-dark-400 overflow-hidden">
                  {imgSrc ? (
                    cert.image_url?.toLowerCase().endsWith('.pdf') ? (
                      <PdfPreview url={imgSrc} className="w-full h-full" />
                    ) : (
                      <img src={imgSrc} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award size={48} className="text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-200/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-white font-bold text-sm leading-snug mb-3 line-clamp-2">{cert.title}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Building2 size={13} className="text-primary shrink-0" />
                      <span className="font-medium">{cert.issuer}</span>
                    </div>
                    {cert.issue_date && (
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar size={13} className="text-primary shrink-0" />
                        <span>{formatDate(cert.issue_date)}</span>
                      </div>
                    )}
                  </div>

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-primary text-xs font-semibold hover:underline"
                    >
                      <ExternalLink size={13} />
                      Lihat Credential
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {certs.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Award size={40} className="mx-auto mb-4 opacity-30" />
            <p>Belum ada sertifikat. Tambahkan melalui Admin Panel.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {activeCert && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all"
          onClick={() => setActiveCert(null)}
        >
          <div 
            className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setActiveCert(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-dark-300 hover:bg-dark-400 border border-dark-400 p-2 rounded-full transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="flex flex-col md:flex-row min-h-[300px]">
              {/* Top/Left: Image or PDF Preview */}
              <div className="md:w-3/5 bg-black flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dark-400 p-4 min-h-[220px] md:min-h-[300px]">
                {activeCert.image_url ? (
                  activeCert.image_url.toLowerCase().endsWith('.pdf') ? (
                    <PdfPreview url={`${API_URL}${activeCert.image_url}`} className="w-full h-full max-h-[70vh]" />
                  ) : (
                    <img 
                      src={`${API_URL}${activeCert.image_url}`} 
                      alt={activeCert.title} 
                      className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow"
                    />
                  )
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                    <Award size={64} className="text-primary/30 mb-2" />
                    <span>Tidak ada berkas sertifikat</span>
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="md:w-2/5 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full w-fit">
                    <Award size={12} />
                    <span>Sertifikat Profesional</span>
                  </div>
                  
                  <h3 className="text-white font-bold text-lg leading-snug">{activeCert.title}</h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-gray-300 text-sm">
                      <Building2 size={15} className="text-primary shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500 text-xs">Penerbit</p>
                        <p className="font-semibold text-gray-200">{activeCert.issuer}</p>
                      </div>
                    </div>

                    {activeCert.issue_date && (
                      <div className="flex items-start gap-2.5 text-gray-300 text-sm">
                        <Calendar size={15} className="text-primary shrink-0 mt-1" />
                        <div>
                          <p className="text-gray-500 text-xs">Tanggal Terbit</p>
                          <p className="font-semibold text-gray-200">{formatDate(activeCert.issue_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-dark-400 mt-6 flex gap-3">
                  {activeCert.credential_url && (
                    <a
                      href={activeCert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 flex-1"
                    >
                      <ExternalLink size={14} />
                      Lihat Credential
                    </a>
                  )}
                  <button
                    onClick={() => setActiveCert(null)}
                    className="btn-secondary text-xs py-2.5 px-4 flex-1"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
