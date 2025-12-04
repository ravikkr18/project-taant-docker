'use client';

import React, { useState } from 'react';
import { Star, Plus, X, CheckCircle } from 'lucide-react';
import MediaUpload from './MediaUpload';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface ReviewFormProps {
  productId: string;
  variantId?: string;
  onSubmit: (reviewData: {
    product_id: string;
    variant_id?: string;
    rating: number;
    title?: string;
    content?: string;
    pros?: string[];
    cons?: string[];
    order_id?: string;
    media?: Array<{
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
    }>;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ReviewForm({
  productId,
  variantId,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [proInput, setProInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);
  const [conInput, setConInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<any[]>([]);
  const { uploadMedia, isUploading, uploadProgress, errors: uploadErrors } = useMediaUpload();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (title && title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (content && content.length > 2000) {
      newErrors.content = 'Review must be 2000 characters or less';
    }

    if (pros.length > 5) {
      newErrors.pros = 'Maximum 5 pros allowed';
    }

    if (cons.length > 5) {
      newErrors.cons = 'Maximum 5 cons allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let uploadedMedia = [];

    // Upload media if any files were selected
    if (media.length > 0) {
      try {
        uploadedMedia = await uploadMedia(media);
      } catch (error) {
        // Upload failed, don't submit the review
        return;
      }
    }

    const reviewData = {
      product_id: productId,
      variant_id: variantId,
      rating,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      pros: pros.length > 0 ? pros : undefined,
      cons: cons.length > 0 ? cons : undefined,
      media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
    };

    await onSubmit(reviewData);
  };

  const addPro = () => {
    if (proInput.trim() && pros.length < 5) {
      setPros([...pros, proInput.trim()]);
      setProInput('');
    }
  };

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const addCon = () => {
    if (conInput.trim() && cons.length < 5) {
      setCons([...cons, conInput.trim()]);
      setConInput('');
    }
  };

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleProInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPro();
    }
  };

  const handleConInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCon();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {title.length}/100 characters
          </div>
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us about your experience with this product..."
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {content.length}/2000 characters
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Pros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What did you like? (Optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              onKeyPress={handleProInputKeyPress}
              placeholder="Add a pro..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addPro}
              disabled={!proInput.trim() || pros.length >= 5}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {pros.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pros.map((pro, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  <CheckCircle className="w-3 h-3" />
                  {pro}
                  <button
                    type="button"
                    onClick={() => removePro(index)}
                    className="ml-1 hover:text-green-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500">
            {pros.length}/5 pros added
          </div>
          {errors.pros && (
            <p className="mt-1 text-sm text-red-600">{errors.pros}</p>
          )}
        </div>

        {/* Cons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What could be improved? (Optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              onKeyPress={handleConInputKeyPress}
              placeholder="Add a con..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addCon}
              disabled={!conInput.trim() || cons.length >= 5}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {cons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cons.map((con, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  <X className="w-3 h-3" />
                  {con}
                  <button
                    type="button"
                    onClick={() => removeCon(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500">
            {cons.length}/5 cons added
          </div>
          {errors.cons && (
            <p className="mt-1 text-sm text-red-600">{errors.cons}</p>
          )}
        </div>

        {/* Media Upload */}
        <MediaUpload
          onMediaChange={setMedia}
          maxFiles={5}
          maxFileSize={50 * 1024 * 1024} // 50MB
          className="mb-6"
        />

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium text-gray-700">Uploading media...</p>
            {Object.entries(uploadProgress).map(([mediaId, progress]) => (
              <div key={mediaId} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Media {mediaId}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Errors */}
        {uploadErrors.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-red-600">Upload Errors:</p>
            {uploadErrors.map((error, index) => (
              <div key={index} className="text-sm text-red-600">
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading || rating === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading Media...' : isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}