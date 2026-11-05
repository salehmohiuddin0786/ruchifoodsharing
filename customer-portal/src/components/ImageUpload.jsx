'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Link as LinkIcon, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { uploadImage } from '@/lib/api';

export default function ImageUpload({ value, onChange, label = 'Photo Upload', helperText = 'Upload an image' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mode, setMode] = useState('file');
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const serverUrl = await uploadImage(file);
      onChange(serverUrl);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    onChange('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setMode(mode === 'file' ? 'url' : 'file')}
            className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1"
          >
            {mode === 'file' ? (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste URL instead</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload file instead</span>
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
          <span>{uploadError}</span>
        </div>
      )}

      {mode === 'url' ? (
        <div className="space-y-3">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1C2541] focus:bg-white transition"
          />
          {value && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800';
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow text-red-600 hover:bg-red-50 text-xs flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="hidden"
          />

          {value ? (
            <div className="relative rounded-2xl border-2 border-cyan-200 bg-cyan-50/20 p-3 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 shadow-sm">
                  <img
                    src={value}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-cyan-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center space-x-1 shadow">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Uploaded</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-cyan-900 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>Photo uploaded successfully</span>
                  </div>
                  <p className="text-[11px] text-gray-500 break-all font-mono bg-white p-2 rounded-lg border border-gray-200">
                    {value}
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1.5 bg-[#1C2541] hover:bg-[#0B132B] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50/30 scale-[1.01]'
                  : 'border-gray-300 hover:border-cyan-500 bg-gray-50/60 hover:bg-cyan-50/10'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner">
                  {uploading ? (
                    <Loader2 className="w-7 h-7 animate-spin text-cyan-600" />
                  ) : (
                    <UploadCloud className="w-7 h-7 text-cyan-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-800">
                    {uploading ? 'Uploading image...' : 'Click or drag & drop to upload image'}
                  </p>
                  <p className="text-xs text-gray-500">{helperText}</p>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md">JPG, PNG, WEBP</span>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>

                <button
                  type="button"
                  disabled={uploading}
                  className="mt-2 px-4 py-1.5 bg-[#1C2541] hover:bg-[#0B132B] text-white text-xs font-bold rounded-xl shadow transition"
                >
                  {uploading ? 'Uploading...' : 'Browse Image Files'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
