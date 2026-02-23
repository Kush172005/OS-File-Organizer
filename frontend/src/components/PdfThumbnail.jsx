import { useEffect, useRef, useState } from "react";

let workerSrcSet = false;

/**
 * Renders the first page of a PDF as a thumbnail (canvas).
 * Parent must have defined size (e.g. w-8 h-8 or w-full h-full).
 */
export default function PdfThumbnail({ url, className = "", onError }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url || error) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        if (!workerSrcSet) {
          try {
            const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
            workerSrcSet = true;
          } catch (_) {}
        }
        const pdf = await pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const w = container.clientWidth || 100;
        const h = container.clientHeight || 100;
        const scale = Math.min(w / baseViewport.width, h / baseViewport.height, 2);
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) {
        if (!cancelled) {
          setError(true);
          onError?.();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url, error]);

  if (error) return null;
  return (
    <span ref={containerRef} className={`block relative overflow-hidden bg-gray-100 ${className}`}>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent" />
        </span>
      )}
      <canvas ref={canvasRef} className="block" />
    </span>
  );
}
