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
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Add customer info from user context or use placeholders for non-authenticated users
      const reviewDataWithCustomer = {
        ...reviewData,
        customer_id: user?.id || 'temp-customer-id',
        customer_name: user?.name || 'Anonymous User',
        customer_email: user?.email || 'anonymous@example.com',
      };

      // Get auth token if user is authenticated
      const getAuthToken = () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        }
        return null;
      };

      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify(reviewDataWithCustomer),
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