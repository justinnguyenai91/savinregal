'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function ImageUpload({ value, onChange, multiple = false, label = 'Ảnh' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const images: string[] = Array.isArray(value) ? value : (value ? [value] : []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload thất bại');
        setUploading(false);
        return;
      }

      const newUrls: string[] = data.urls;
      if (multiple) {
        onChange([...images, ...newUrls]);
      } else {
        onChange(newUrls[0] || '');
      }
    } catch {
      setError('Lỗi kết nối khi upload');
    }
    setUploading(false);
  }, [images, multiple, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const removeImage = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>{label}</label>

      {/* Preview */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, i) => {
            // URL đã là HTTPS (Vercel proxy), dùng thẳng không cần transform
            const displayUrl = url;
            return (
              <div key={i} className="relative group">
                <img
                  src={displayUrl}
                  alt={`Upload ${i + 1}`}
                  className="rounded-lg object-cover"
                  style={{ width: '100px', height: '100px', border: '1px solid #E8DDD0' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#DC2626' }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-8 px-4"
        style={{
          border: `2px dashed ${dragOver ? '#2C4A3E' : '#E8DDD0'}`,
          background: dragOver ? '#F0F7F5' : '#FAFAF8',
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2C4A3E', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#6B7280' }}>Đang upload...</p>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              Kéo thả ảnh vào đây hoặc <span style={{ color: '#2C4A3E', textDecoration: 'underline' }}>chọn file</span>
            </p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              JPG, PNG, WebP — Tối đa 5MB {multiple ? '— Nhiều ảnh' : '— 1 ảnh'}
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ''; }}
        className="hidden"
      />

      {error && (
        <p className="text-xs mt-2" style={{ color: '#DC2626' }}>{error}</p>
      )}
    </div>
  );
}
