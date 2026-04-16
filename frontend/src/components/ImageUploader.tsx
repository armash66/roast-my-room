/**
 * ImageUploader — Premium drag & drop with 3D tilt and glow effects.
 */

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Sparkles } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  label?: string;
}

export function ImageUploader({
  onImageSelect,
  disabled = false,
  label,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const clearImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current || disabled) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -8, y: x * 8 });
    },
    [disabled]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled,
  });

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}

      <motion.div
        ref={cardRef}
        {...getRootProps()}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer
          ${
            isDragActive
              ? "border-orange-500/50 bg-orange-500/5 glow-orange"
              : preview
                ? "border-white/[0.08] bg-white/[0.02]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} id="image-upload" />

        {/* Animated border glow on drag */}
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl gradient-border pointer-events-none"
          />
        )}

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video"
            >
              <img
                src={preview}
                alt="Room preview"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-2xl" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-400" />
                  <span className="text-sm text-white/80 truncate max-w-[200px] font-medium">
                    {fileName}
                  </span>
                </div>
                <motion.button
                  onClick={clearImage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 backdrop-blur-sm
                             border border-white/10 transition-colors duration-200"
                  aria-label="Remove image"
                >
                  <X size={14} className="text-white" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 px-6"
            >
              <motion.div
                animate={
                  isDragActive
                    ? { y: -8, scale: 1.15, rotate: 5 }
                    : { y: [0, -6, 0], scale: 1 }
                }
                transition={
                  isDragActive
                    ? { type: "spring", stiffness: 300 }
                    : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative mb-5"
              >
                {isDragActive ? (
                  <ImageIcon size={52} className="text-orange-400" />
                ) : (
                  <Upload size={52} className="text-neutral-600" />
                )}
                <div className="absolute inset-0 blur-2xl bg-orange-500/10 rounded-full scale-150" />
              </motion.div>

              <p className="text-neutral-300 font-semibold text-lg mb-1.5">
                {isDragActive ? "Drop it like it's hot 🔥" : "Drop your room photo"}
              </p>
              <p className="text-neutral-600 text-sm">
                click to browse • JPG, PNG, WebP • Max 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
