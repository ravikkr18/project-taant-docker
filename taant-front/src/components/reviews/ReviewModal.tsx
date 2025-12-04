'use client';

import React from 'react';
import ReviewForm from './ReviewForm';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  variantId?: string;
  onSubmit: (reviewData: any) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  variantId,
  onSubmit,
  isSubmitting
}: ReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <ReviewForm
          productId={productId}
          variantId={variantId}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}