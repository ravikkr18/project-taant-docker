'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { products, searchProducts } from '@/data/products';
import { Search, Filter, Grid, List, ChevronDown, X, Star } from 'lucide-react';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  const [searchResults, setSearchResults] = useState(products);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: category,
    priceRange: [0, 2000],
    rating: 0,
    brand: [] as string[],
    inStock: true
  });

  const categories = [
    { id: 'all', name: 'All Categories', count: 8 },
    { id: 'electronics', name: 'Electronics', count: 3 },
    { id: 'fashion', name: 'Fashion', count: 1 },
    { id: 'home-kitchen', name: 'Home & Kitchen', count: 2 },
    { id: 'sports-outdoors', name: 'Sports & Outdoors', count: 1 },
    { id: 'toys-games', name: 'Toys & Games', count: 1 },
  ];

  const brands = [
    { id: 'apple', name: 'Apple', count: 1 },
    { id: 'sony', name: 'Sony', count: 1 },
    { id: 'nike', name: 'Nike', count: 1 },
    { id: 'samsung', name: 'Samsung', count: 1 },
    { id: 'dyson', name: 'Dyson', count: 1 },
    { id: 'lego', name: 'LEGO', count: 1 },
    { id: 'instant-pot', name: 'Instant Pot', count: 1 },
    { id: 'theragun', name: 'Theragun', count: 1 },
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Avg. Customer Review' },
    { id: 'newest', name: 'Newest Arrivals' },
  ];

  useEffect(() => {
    let results = query ? searchProducts(query) : products;

    // Apply filters
    if (selectedFilters.category !== 'all') {
      results = results.filter(product => product.categoryId === selectedFilters.category);
    }

    results = results.filter(product =>
      product.price >= selectedFilters.priceRange[0] &&
      product.price <= selectedFilters.priceRange[1]
    );

    if (selectedFilters.rating > 0) {
      results = results.filter(product => (product.rating || 0) >= selectedFilters.rating);
    }

    if (selectedFilters.brand.length > 0) {
      results = results.filter(product =>
        product.brand && selectedFilters.brand.includes(product.brand.toLowerCase())
      );
    }

    if (selectedFilters.inStock) {
      results = results.filter(product => product.inStock);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setSearchResults(results);
  }, [query, selectedFilters, sortBy]);

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleBrandToggle = (brandId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      brand: prev.brand.includes(brandId)
        ? prev.brand.filter(b => b !== brandId)
        : [...prev.brand, brandId]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: 'all',
      priceRange: [0, 2000],
      rating: 0,
      brand: [],
      inStock: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {query ? `Results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 mb-6"
              >
                Clear all filters
              </button>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedFilters.category === cat.id}
                        onChange={() => handleFilterChange('category', cat.id)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={selectedFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [selectedFilters.priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${selectedFilters.priceRange[0]}</span>
                    <span>${selectedFilters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.brand.includes(brand.id)}
                        onChange={() => handleBrandToggle(brand.id)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{brand.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">({brand.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating)}
                      className={`flex items-center gap-2 text-sm ${selectedFilters.rating === rating ? 'text-orange-600' : 'text-gray-700'}`}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span>& up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 mb-4"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Products Grid */}
            {searchResults.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {searchResults.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const SearchPageWrapper = () => (
  <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
    <SearchPage />
  </Suspense>
);

export default SearchPageWrapper;