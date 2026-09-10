"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { Camera, X, ScanBarcode, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';

export const BarcodeScannerModal: React.FC = () => {
  const { scannerModal, closeScannerModal, products, showToast } = useERP();
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Synthesize beep sound via Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setCameraError('Trình duyệt hoặc môi trường iFrame không hỗ trợ truy cập Camera trực tiếp.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể khởi động camera';
      setCameraError(`Camera không khả dụng (${errorMsg}). Bạn có thể click nhanh vào danh sách mã vạch mẫu bên dưới.`);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (scannerModal.isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scannerModal.isOpen]);

  const handleScanned = (code: string) => {
    playBeep();
    showToast(`🎯 Đã quét barcode: ${code}`);
    scannerModal.onDetected(code);
    closeScannerModal();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanned(manualCode.trim());
  };

  if (!scannerModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-indigo-500/40 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Máy Quét Mã Vạch Barcode / QR Web
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  Zero-Cost 0đ
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sử dụng Camera thiết bị hoặc click thử nghiệm tức thì</p>
            </div>
          </div>
          <button
            onClick={closeScannerModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="p-6 space-y-5">
          <div className="relative h-56 w-full rounded-2xl bg-black border border-slate-700/80 overflow-hidden flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                <ScanBarcode className="h-12 w-12 text-indigo-400/60 animate-pulse" />
                <p className="text-xs text-slate-400 max-w-sm">
                  {cameraError || 'Đang sẵn sàng kết nối camera... Căn chỉnh mã vạch vào giữa khung ngắm.'}
                </p>
              </div>
            )}

            {/* Target Laser Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="relative w-64 h-32 border-2 border-dashed border-indigo-400/70 rounded-xl flex items-center justify-center">
                {/* Laser animation line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-bounce" />
                <span className="text-[10px] text-indigo-300 font-mono tracking-widest bg-slate-900/80 px-2 py-0.5 rounded">
                  SCAN ZONE
                </span>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 text-[10px] text-slate-300">
              <Volume2 className="h-3 w-3 text-emerald-400" /> Âm thanh bíp sẵn sàng
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Nhập thủ công hoặc quét từ máy bắn USB (EAN-13, SKU...)"
              className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              Chọn
            </button>
          </form>

          {/* Fast Test Barcodes List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Bắn thử mã vạch sản phẩm nhanh:
              </span>
              <span className="text-[11px] text-slate-400">Click để mô phỏng máy quét</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {products.slice(0, 6).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleScanned(prod.barcode)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-left transition-colors group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                      {prod.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {prod.barcode} ({prod.category})
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/70 flex justify-end">
          <button
            onClick={closeScannerModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

