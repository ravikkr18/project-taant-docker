'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchPage from '../../search/page';

const CategoryPage = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id') || '';

  // Redirect to search page with category filter
  const url = new URL('/search', window.location.origin);
  url.searchParams.set('category', categoryId);

  if (typeof window !== 'undefined') {
    window.location.href = url.toString();
    return null;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
};

export default CategoryPage;