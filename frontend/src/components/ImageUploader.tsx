/**
 * ImageUploader — Brutalist Upload Target
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileImage } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({
  onImageSelect,
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

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
      <div className="font-bold border-b-2 border-black inline-block mb-3 uppercase text-sm tracking-wide">
        TARGET.IMAGE_FILE
      </div>

      <div
        {...getRootProps()}
        className={`
          brutal-box relative overflow-hidden cursor-pointer transition-none min-h-[200px]
          flex flex-col items-center justify-center
          ${isDragActive ? "bg-[#b2ff05] shadow-[inset_4px_4px_0px_#111]" : "bg-white"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} id="image-upload" />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full aspect-video"
            >
              <img
                src={preview}
                alt="Room target"
                className="w-full h-full object-cover border-b-2 border-black"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 font-mono text-xs border-r-2 border-b-2 border-black">
                {fileName}
              </div>
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-[#ff3b30] border-2 border-black p-1 hover:translate-x-[2px] hover:translate-y-[2px] transition-transform text-white"
                title="Clear target"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <div className="border-4 border-black p-4 mb-4 bg-white shadow-[4px_4px_0px_0px_#111]">
                {isDragActive ? <FileImage size={48} /> : <Upload size={48} />}
              </div>
              <p className="font-black text-xl uppercase mb-1">
                {isDragActive ? "CONFIRM TARGET" : "SELECT TARGET IMAGE"}
              </p>
              <p className="font-mono text-gray-500 text-sm">
                [DRAG & DROP OR CLICK] MAX: 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
