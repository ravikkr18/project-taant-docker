import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface MediaItem {
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

interface UploadedMedia {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number;
  position?: number;
  is_primary?: boolean;
}

export function useMediaUpload(reviewId?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const { user } = useAuth();

  const uploadMedia = useCallback(async (
    mediaItems: MediaItem[],
    tempReviewId?: string
  ): Promise<UploadedMedia[]> => {
    setIsUploading(true);
    setErrors([]);
    setUploadProgress({});

    try {

      const uploadedMedia: UploadedMedia[] = [];

      for (const [index, mediaItem] of mediaItems.entries()) {
        try {
          // Generate a temporary review ID if not provided
          const currentReviewId = reviewId || tempReviewId || `temp-${Date.now()}`;

          // Step 1: Get signed URL for upload
          const uploadUrlResponse = await fetch('/api/reviews/media/upload-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reviewId: currentReviewId,
              fileName: mediaItem.file.name,
              contentType: mediaItem.file.type,
            }),
          });

          if (!uploadUrlResponse.ok) {
            throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
          }

          const { url, publicUrl } = await uploadUrlResponse.json();

          // Step 2: Upload file directly to S3
          const uploadFormData = new FormData();

          // Create a Blob from the file
          const fileBlob = new Blob([mediaItem.file], { type: mediaItem.file.type });

          // Use XHR for progress tracking
          const uploadPromise = new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(prev => ({
                  ...prev,
                  [mediaItem.id]: progress
                }));
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener('error', () => {
              reject(new Error('Upload failed'));
            });

            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', mediaItem.file.type);
            xhr.send(fileBlob);
          });

          await uploadPromise;

          // Step 3: Prepare media data for the review
          const uploadedItem: UploadedMedia = {
            id: mediaItem.id,
            media_url: publicUrl,
            media_type: mediaItem.type,
            file_name: mediaItem.file.name,
            file_size: mediaItem.metadata?.size,
            mime_type: mediaItem.file.type,
            width: mediaItem.metadata?.width,
            height: mediaItem.metadata?.height,
            duration: mediaItem.metadata?.duration,
            position: index,
            is_primary: index === 0, // First item is primary
          };

          uploadedMedia.push(uploadedItem);

        } catch (error) {
          console.error('Error uploading media item:', error);
          setErrors(prev => [
            ...prev,
            `Failed to upload ${mediaItem.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          ]);
        }
      }

      return uploadedMedia;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload media';
      setErrors([errorMessage]);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [reviewId]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    uploadMedia,
    isUploading,
    uploadProgress,
    errors,
    clearErrors,
  };
}