import { useEffect, useRef, useState } from "react";
import AvatarEditor, { type AvatarEditorRef } from "react-avatar-editor";

interface Props {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

const AvatarCropperModal = ({ open, file, onCancel, onSave }: Props) => {
  const editorRef = useRef<AvatarEditorRef | null>(null);
  const [scale, setScale] = useState(1.1);
  const [rotate, setRotate] = useState(0);
  const [size, setSize] = useState(280);

  useEffect(() => {
    if (open) {
      setScale(1.1);
      setRotate(0);
      const w = Math.min(window.innerWidth - 64, 320);
      setSize(w);
    }
  }, [open, file]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !file) return null;

  const handleSave = () => {
    if (!editorRef.current) return;
    const canvas = editorRef.current.getImageScaledToCanvas();
    // Compress to JPEG ~0.85 quality (under ~500KB for typical sizes)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onSave(dataUrl);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          boxShadow: "0 24px 48px rgba(15,23,42,0.18)",
          border: "1px solid rgba(195,198,215,0.4)",
        }}
      >
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-lg font-bold" style={{ color: "#191c1e" }}>
            Adjust your profile photo
          </h3>
          <p className="text-xs mt-1" style={{ color: "#737686" }}>
            Drag to position. Zoom in or out for the perfect fit.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 pb-4">
          <div className="rounded-xl overflow-hidden" style={{ background: "#0f172a" }}>
            <AvatarEditor
              ref={editorRef}
              image={file}
              width={size}
              height={size}
              border={20}
              borderRadius={size}
              color={[15, 23, 42, 0.6]}
              scale={scale}
              rotate={rotate}
              crossOrigin="anonymous"
            />
          </div>
        </div>

        <div className="px-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "#434655" }}>
                Zoom
              </span>
              <span className="text-xs" style={{ color: "#737686" }}>
                {scale.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(1, +(s - 0.1).toFixed(2)))}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,74,198,0.08)", color: "#004AC6" }}
                aria-label="Zoom out"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-[#004AC6]"
                style={{ accentColor: "#004AC6" }}
              />
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(3, +(s + 0.1).toFixed(2)))}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,74,198,0.08)", color: "#004AC6" }}
                aria-label="Zoom in"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "#434655" }}>
              Rotate
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotate((r) => (r - 90) % 360)}
                className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ background: "rgba(0,74,198,0.08)", color: "#004AC6" }}
              >
                <span className="material-symbols-outlined text-[16px]">rotate_left</span>
                Left
              </button>
              <button
                type="button"
                onClick={() => setRotate((r) => (r + 90) % 360)}
                className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ background: "rgba(0,74,198,0.08)", color: "#004AC6" }}
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
                Right
              </button>
            </div>
          </div>
        </div>

        <div
          className="px-6 py-5 mt-4 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.96]"
            style={{ background: "#ffffff", color: "#434655", border: "1px solid #c3c6d7" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.96]"
            style={{
              background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)",
              boxShadow: "0 10px 15px -3px rgba(0,74,198,0.25)",
            }}
          >
            Save &amp; Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropperModal;
