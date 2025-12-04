import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewSubmissionData {
  product_id: string;
  variant_id?: string;
  rating: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  order_id?: string;
}

export function useReviewSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const submitReview = async (reviewData: ReviewSubmissionData): Promise<void> => {
    if (!user) {
      setError('You must be logged in to submit a review');
      throw new Error('Authentication required');
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await user.getIdToken();

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess('Review submitted successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    submitReview,
    isSubmitting,
    error,
    success,
    clearMessages,
  };
}