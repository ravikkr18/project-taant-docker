'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  placeholderType?: 'blur' | 'color' | 'gradient' | 'pattern';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  style,
  fallbackSrc,
  placeholderType = 'gradient'
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Generate placeholder based on type
  const generatePlaceholder = () => {
    const base64Placeholder = {
      // Gradient placeholder
      gradient: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAwIDQwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRjNGY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM5QkI5QjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNnB4Ij7BvYXJkaW5nIFN0b3JlPC90ZXh0Pjwvc3ZnPg==',
      // Color placeholder (light gray)
      color: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAwIDQwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRkZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM5QkI5QjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNnB4Ij7JbWFnZSBVbmxvYWRlZDwvdGV4dD48L3N2Zz4=',
      // Pattern placeholder
      pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAwIDQwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIj48ZGVmcz48cGF0dGVybiBpZD0iaW1hZ2UtMTAiIHBhdHRlcm5Vbml0cz0iMSAxIiBwYXR0ZXJuV3aWR0aD0iMTAiIHBhdHRlcm5IZWlnaHQ9IjEwIiBmaWxsPSIjNGNGNEY0Ii8+PHBhdHRlcm4gaWQ9ImltYWdlLTExIiB4PSIxIiB5PSIxMSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZ0Q0RDBCIgcng9IjAiIHJ5PSIwIi8+PHBhdHRlcm4gaWQ9ImltYWdlLTEyIiB4PSIxMSIgeT0iMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjREREREQSIgcng9IjEiIHJ5PSIwIi8+PHBhdHRlcm4gaWQ9ImltYWdlLTEzIiB4PSIwIiB5PSIxMSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjREREREQSIgcng9IjAiIHJ5PSIxIi8+PHBhdHRlcm4gaWQ9ImltYWdlLTE0IiB4PSIxMSIgeT0iMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNGNGNEY0IiByeD0iMSIgcnk9IjAiLz48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjY0Y2FjYSIgZmlsbC1vcGFjaXR5PSIwLjEiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM5QkI5QjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNnB4Ij5JbWFnZSBVbmxvYWRlZDwvdGV4dD48L3JlY3Q+PC9zdmc+',
      // Blur placeholder
      blur: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAwIDQwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIj48ZmlsdGVyIGlkPSJibHVyIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz48ZmVHY29tcG9zaXRlIGluPSJTb3VyY2VHcmFwaGljIiBvcGVyYXRvcj0iZHVwbGljYXRlIiByZXN1bHQ9ImJsdXIiIGluMj0iU291cmNlR3JhcGhpYyIgYXV0bz0iMTAwIiAvPjwvZmlsdGVyPjwvc3ZnPg=='
    };

    // Use reliable Picsum photos as fallbacks with consistent seeds
    const picsumPlaceholders = {
      gradient: `https://picsum.photos/seed/placeholder-gradient/400/400.jpg`,
      color: `https://picsum.photos/seed/placeholder-color/400/400.jpg`,
      pattern: `https://picsum.photos/seed/placeholder-pattern/400/400.jpg`,
      blur: `https://picsum.photos/seed/placeholder-blur/400/400.jpg`
    };

    // Return custom fallback first, then picsum, then SVG as last resort
    return fallbackSrc || picsumPlaceholders[placeholderType] || base64Placeholder[placeholderType];
  };

  useEffect(() => {
    setImageSrc(src);
    setImageLoaded(false);
    setImageError(false);
    setShowPlaceholder(true);
  }, [src]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setShowPlaceholder(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setShowPlaceholder(true);
    setImageLoaded(false);
  };

  const imageProps = {
    src: imageError ? generatePlaceholder() : imageSrc,
    alt,
    className,
    priority,
    sizes,
    onLoad: handleImageLoad,
    onError: handleImageError,
    style: {
      objectFit: 'cover' as const,
      ...style,
    },
  };

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {showPlaceholder && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-200"
            style={{
              backgroundImage: `url(${generatePlaceholder()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.7,
              ...style
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-4-4l4.586 4.586a2 2 0 012.828 0L16 16m-4-4l4.586 4.586a2 2 0 012.828 0L16 16m-4-4l4.586 4.586a2 2 0 012.828 0L16 16" />
              </svg>
              <span className="text-xs text-gray-500 mt-2">Image</span>
            </div>
          </div>
        )}
        <Image {...imageProps} fill />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showPlaceholder && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-200"
          style={{
            backgroundImage: `url(${generatePlaceholder()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.7,
            width: width,
            height: height,
            ...style
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-4-4l4.586 4.586a2 2 0 012.828 0L16 16m-4-4l4.586 4.586a2 2 0 012.828 0L16 16m-4-4l4.586 4.586a2 2 0 012.828 0L16 16" />
            </svg>
            <span className="text-xs text-gray-500 mt-2">Image</span>
          </div>
        </div>
      )}
      <Image {...imageProps} width={width} height={height} />
    </div>
  );
};

export default ImageWithFallback;