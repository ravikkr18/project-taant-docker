'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, AlertCircle } from 'lucide-react';

interface ReviewMedia {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
  };
}

interface MediaUploadProps {
  onMediaChange: (media: ReviewMedia[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedImageTypes?: string[];
  acceptedVideoTypes?: string[];
  className?: string;
}

export default function MediaUpload({
  onMediaChange,
  maxFiles = 5,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'],
  className = ''
}: MediaUploadProps) {
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [...acceptedImageTypes, ...acceptedVideoTypes];

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }

    if (file.size > maxFileSize) {
      return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    return null;
  };

  const getFileMetadata = async (file: File): Promise<ReviewMedia['metadata']> => {
    return new Promise((resolve) => {
      const metadata: ReviewMedia['metadata'] = {
        size: file.size
      };

      if (file.type.startsWith('image/')) {
        const img = new window.Image();
        img.onload = () => {
          metadata.width = img.width;
          metadata.height = img.height;
          resolve(metadata);
        };
        img.onerror = () => {
          resolve(metadata);
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          metadata.width = video.videoWidth;
          metadata.height = video.videoHeight;
          metadata.duration = video.duration;
          resolve(metadata);
        };
        video.onerror = () => {
          resolve(metadata);
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(metadata);
      }
    });
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadeddata = () => {
          // Create thumbnail for video
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.3));
          } else {
            resolve('');
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve('');
      }
    });
  };

  const addMedia = async (files: FileList | File[]) => {
    const newErrors: string[] = [];
    const fileArray = Array.from(files);

    if (media.length + fileArray.length > maxFiles) {
      newErrors.push(`Cannot add more than ${maxFiles} files`);
      setErrors(newErrors);
      return;
    }

    const newMedia: ReviewMedia[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        newErrors.push(validationError);
        continue;
      }

      const [preview, metadata] = await Promise.all([
        createPreview(file),
        getFileMetadata(file)
      ]);

      newMedia.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        preview,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        metadata
      });
    }

    setErrors(newErrors);

    if (newMedia.length > 0) {
      const updatedMedia = [...media, ...newMedia];
      setMedia(updatedMedia);
      onMediaChange(updatedMedia);
    }
  };

  const removeMedia = (id: string) => {
    const updatedMedia = media.filter(item => item.id !== id);
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addMedia(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addMedia(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos & Videos (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add up to {maxFiles} images or videos to show your experience. Max file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
        </p>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${media.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={media.length < maxFiles ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={media.length >= maxFiles}
            className="hidden"
          />

          <div className="space-y-3">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop your files here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports: {acceptedImageTypes.join(', ')}, {acceptedVideoTypes.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Media ({media.length}/{maxFiles})
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((item) => (
              <div key={item.id} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      {item.type === 'video' ? (
                        <Video className="w-8 h-8 text-gray-400" />
                      ) : (
                        <Image className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'video'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type === 'video' ? (
                        <>
                          <Video className="w-3 h-3" />
                          Video
                        </>
                      ) : (
                        <>
                          <Image className="w-3 h-3" />
                          Image
                        </>
                      )}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeMedia(item.id)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Info */}
                <div className="mt-1 text-xs text-gray-500 truncate" title={item.file.name}>
                  {item.file.name}
                </div>
                {item.metadata?.size && (
                  <div className="text-xs text-gray-400">
                    {(item.metadata.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}