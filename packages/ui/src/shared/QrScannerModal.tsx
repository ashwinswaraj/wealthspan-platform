import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useIsMobile } from "@jobrio/hooks/use-mobile";

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanResult: (decodedText: string) => void;
}

const QrScannerModal = ({ open, onClose, onScanResult }: QrScannerModalProps) => {
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerIdRef = useRef(`qr-reader-${Date.now()}`);
  const isMobile = useIsMobile();

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2) await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      // Ignore cleanup errors when scanner is already stopped/disposed.
    }
    trackRef.current = null;
    setFlashOn(false);
    setCameraReady(false);
  }, []);

  const handleSuccess = useCallback(
    (decodedText: string) => {
      // Vibration
      if (navigator.vibrate) navigator.vibrate(200);

      // Success sound
      try {
        const audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.stop(audioCtx.currentTime + 0.3);
      } catch {
        // Ignore audio errors (autoplay/device restrictions).
      }

      onScanResult(decodedText);
      stopScanner();
      onClose();
    },
    [onScanResult, onClose, stopScanner],
  );

  const startScanner = useCallback(async () => {
    setError(null);
    setCameraReady(false);
    const scannerId = scannerIdRef.current;
    await new Promise((r) => setTimeout(r, 150));
    const el = document.getElementById(scannerId);
    if (!el) return;
    try {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      const scanBoxSize = isMobile ? 250 : 220;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: scanBoxSize, height: scanBoxSize }, aspectRatio: 1 },
        (decodedText) => handleSuccess(decodedText),
        () => {},
      );
      setCameraReady(true);
      const videoEl = el.querySelector("video");
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) trackRef.current = videoTrack;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setError("camera_denied");
      } else if (msg.includes("NotFoundError") || msg.includes("no camera")) {
        setError("no_camera");
      } else {
        setError("camera_denied");
      }
    }
  }, [handleSuccess, isMobile]);

  useEffect(() => {
    if (open) startScanner();
    return () => {
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

  const toggleFlash = useCallback(async () => {
    const track = trackRef.current;
    if (!track) return;
    try {
      const caps = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (caps?.torch) {
        const newState = !flashOn;
        await track.applyConstraints({
          advanced: [{ torch: newState } as MediaTrackConstraintSet],
        });
        setFlashOn(newState);
      }
    } catch {
      // Ignore torch failures on unsupported devices/browsers.
    }
  }, [flashOn]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      const tempId = `qr-file-reader-${Date.now()}`;
      const tempDiv = document.createElement("div");
      let fileScanner: Html5Qrcode | null = null;

      try {
        tempDiv.id = tempId;
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);
        fileScanner = new Html5Qrcode(tempId);
        const result = await fileScanner.scanFile(file, true);
        handleSuccess(result);
      } catch {
        setError("scan_failed");
        setTimeout(() => setError(null), 3000);
      } finally {
        try {
          fileScanner?.clear();
        } catch {
          // Ignore cleanup errors from the temporary image scanner.
        }
        tempDiv.remove();
      }
    },
    [handleSuccess],
  );

  const retryCamera = useCallback(() => {
    setError(null);
    startScanner();
  }, [startScanner]);

  if (!open) return null;

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  // Corner border component
  const CornerBorder = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
    const corners = {
      tl: "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl",
      tr: "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl",
      bl: "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
      br: "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
    };
    return (
      <div
        className={`absolute w-10 h-10 z-20 ${corners[position]}`}
        style={{ borderColor: "#004AC6" }}
      />
    );
  };

  // Error state UI
  if (error === "camera_denied" || error === "no_camera") {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center px-8">
        <div className="absolute top-0 left-0 right-0 flex items-center px-5 py-4 z-10">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors mr-3"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-headline font-bold text-white text-lg">Scan QR</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">
            {error === "no_camera" ? "No Camera Found" : "Camera Access Required"}
          </h3>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            {error === "no_camera"
              ? "No camera device was detected on this device."
              : "Camera access is required to scan QR codes. Please allow camera permissions in your browser settings."}
          </p>
          <button
            onClick={retryCamera}
            className="cta-blue-glow w-full h-12 text-white font-bold rounded-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Desktop modal
  if (!isMobile) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center"
        onClick={handleClose}
      >
        <div
          className="relative bg-surface rounded-3xl shadow-2xl w-[420px] max-w-[90vw] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ border: "1px solid rgba(195,198,215,0.2)" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
            <div>
              <h2 className="font-headline font-bold text-on-surface text-lg">Scan QR</h2>
              <p className="text-on-surface-variant text-xs">Professionals • Clients</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-on-surface-variant"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="relative w-[260px] h-[260px] mx-auto">
              <CornerBorder position="tl" />
              <CornerBorder position="tr" />
              <CornerBorder position="bl" />
              <CornerBorder position="br" />
              {cameraReady && (
                <div
                  className="absolute left-3 right-3 h-0.5 z-20 animate-scan-line"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,74,198,0.9), transparent)",
                    boxShadow: "0 0 12px rgba(0,74,198,0.5)",
                  }}
                />
              )}
              <div
                id={scannerIdRef.current}
                className="w-full h-full overflow-hidden rounded-xl [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
              />
            </div>
            {error === "scan_failed" && (
              <p className="text-red-500 text-sm mt-4 text-center">
                No QR code found in the uploaded image.
              </p>
            )}
          </div>

          <div className="flex justify-center gap-4 px-6 pb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors text-sm font-bold"
              style={{
                background: "rgba(0,74,198,0.06)",
                color: "#004AC6",
                border: "1px solid rgba(195,198,215,0.3)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              Upload
            </button>
            <button
              onClick={toggleFlash}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors text-sm font-bold"
              style={{
                background: flashOn ? "#ffffff" : "rgba(0,74,198,0.06)",
                color: flashOn ? "#191c1e" : "#004AC6",
                border: `1px solid ${flashOn ? "#ffffff" : "rgba(195,198,215,0.3)"}`,
                boxShadow: flashOn ? "0 0 20px rgba(255,255,255,0.5)" : "none",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
                <line x1="6" y1="6" x2="18" y2="6" />
                <line x1="12" y1="12" x2="12" y2="14" />
              </svg>
              {flashOn ? "Torch On" : "Torch"}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    );
  }

  // Mobile fullscreen scanner
  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "#000" }}>
      {/* Camera preview fills the background */}
      <div className="absolute inset-0">
        <div
          id={scannerIdRef.current}
          className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
        />
      </div>

      {/* Dark overlay with transparent scan area + corner borders + scan line (all centered together) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="relative w-[280px] h-[280px]">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" }}
          ></div>
          <CornerBorder position="tl" />
          <CornerBorder position="tr" />
          <CornerBorder position="bl" />
          <CornerBorder position="br" />
          {cameraReady && (
            <div
              className="absolute left-3 right-3 h-0.5 z-20 animate-scan-line"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,74,198,0.9), transparent)",
                boxShadow: "0 0 15px rgba(0,74,198,0.5)",
              }}
            />
          )}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center px-5 pt-12 pb-4">
        <button
          onClick={handleClose}
          className="p-2.5 rounded-full hover:bg-white/10 transition-colors mr-4"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-headline font-bold text-white text-lg leading-tight">Scan QR</h2>
          <p className="text-white/50 text-xs">Professionals • Clients</p>
        </div>
      </div>

      {/* Spacer to push controls to bottom */}
      <div className="relative z-20 flex-1"></div>

      {/* Error messages */}
      {error === "scan_failed" && (
        <div className="relative z-20 px-6">
          <p className="text-red-400 text-sm text-center">
            No QR code found in the uploaded image.
          </p>
        </div>
      )}

      {/* Bottom controls */}
      <div className="relative z-20 flex justify-center gap-8 px-6 pb-10 pt-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <span className="text-white text-[11px] font-bold">Upload</span>
        </button>
        <button onClick={toggleFlash} className="flex flex-col items-center gap-2">
          <div
            className={`w-14 h-14 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${flashOn ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.6)]" : "bg-white/10 hover:bg-white/20"}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={flashOn ? "#191c1e" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
              <line x1="6" y1="6" x2="18" y2="6" />
              <line x1="12" y1="12" x2="12" y2="14" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-white">{flashOn ? "Torch On" : "Torch"}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default QrScannerModal;
