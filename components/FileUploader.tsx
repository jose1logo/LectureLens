import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ selectedFile, onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Handle Preview Generation (Image or PDF)
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);
    const objectUrl = URL.createObjectURL(selectedFile);

    if (selectedFile.type === 'application/pdf' && window.pdfjsLib) {
      // PDF Preview Logic
      const generatePdfPreview = async () => {
        try {
          const loadingTask = window.pdfjsLib.getDocument(objectUrl);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPreviewUrl(canvas.toDataURL());
          }
        } catch (error) {
          console.error("PDF Preview failed:", error);
          setPreviewUrl(null); 
        } finally {
          setIsPreviewLoading(false);
        }
      };
      generatePdfPreview();
    } else {
      // Standard Image
      // Add a small delay to simulate processing for consistent UI experience or just load it
      const img = new Image();
      img.onload = () => setIsPreviewLoading(false);
      img.onerror = () => setIsPreviewLoading(false);
      img.src = objectUrl;
      setPreviewUrl(objectUrl);
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert("Please upload an image file (JPG, PNG) or a PDF document.");
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        1. Upload Document
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer min-h-[240px] flex flex-col items-center justify-center overflow-hidden
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFile ? 'bg-slate-50 border-indigo-200' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleChange}
          disabled={disabled}
        />

        {isPreviewLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center animate-in fade-in">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Processing file...</p>
            </div>
        ) : !selectedFile ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-1">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Drop photo or click to upload
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports handwriting & slides (JPG, PDF)
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-100/50">
            {selectedFile.type === 'application/pdf' && (
               <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">PDF</div>
            )}
            
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[220px] max-w-full object-contain shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                 {selectedFile.type === 'application/pdf' ? <FileText className="w-12 h-12" /> : <ImageIcon className="w-12 h-12" />}
                 <span className="text-xs">{selectedFile.name}</span>
              </div>
            )}

            <button
              onClick={clearFile}
              className="absolute top-2 right-2 bg-white text-slate-500 hover:text-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all z-20 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};