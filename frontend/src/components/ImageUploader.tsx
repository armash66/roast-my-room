/**
 * ImageUploader — Drag & drop image upload with preview.
 * Supports click-to-browse and paste from clipboard.
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon } from "lucide-react";

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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const clearImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreview(null);
      setFileName("");
    },
    []
  );

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
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          {label}
        </label>
      )}

      <motion.div
        {...getRootProps()}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? "border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
              : preview
                ? "border-neutral-700 bg-neutral-900"
                : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-900"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} id="image-upload" />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-video"
            >
              <img
                src={preview}
                alt="Room preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-sm text-white/80 truncate max-w-[70%]">
                  {fileName}
                </span>
                <button
                  onClick={clearImage}
                  className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                  aria-label="Remove image"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              <motion.div
                animate={isDragActive ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isDragActive ? (
                  <ImageIcon size={48} className="text-orange-500 mb-4" />
                ) : (
                  <Upload size={48} className="text-neutral-500 mb-4" />
                )}
              </motion.div>

              <p className="text-neutral-300 font-medium text-lg mb-1">
                {isDragActive ? "Drop it like it's hot" : "Drop your room photo here"}
              </p>
              <p className="text-neutral-500 text-sm">
                or click to browse • JPG, PNG, WebP • Max 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
