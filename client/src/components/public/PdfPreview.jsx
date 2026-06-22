import { useEffect, useRef, useState } from 'react';

export default function PdfPreview({ url, className }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function renderPdf() {
      try {
        if (!url) return;
        setLoading(true);
        setError(false);

        // 1. Load pdfjsLib dynamically if not available
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
            script.onload = () => {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!active) return;

        // 2. Fetch and load PDF document
        const loadingTask = window.pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (!active) return;

        // 3. Render the first page
        const page = await pdf.getPage(1);

        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        // Fit to container scale (we want a good resolution)
        const viewport = page.getViewport({ scale: 1.2 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error rendering PDF:', err);
        setError(true);
        setLoading(false);
      }
    }

    renderPdf();

    return () => {
      active = false;
    };
  }, [url]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-300 text-gray-500 p-2 text-center">
        <span className="text-[10px] font-semibold text-red-400">PDF Load Error</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-300/50">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
    </div>
  );
}
