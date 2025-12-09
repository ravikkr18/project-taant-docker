'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { pincode, city, setPincode } = useLocation();
  const { user, isAuthenticated, login, logout, showAuthModal, hideAuthModal, isAuthModalOpen, authMode } = useAuth();

  // Load cart count from localStorage
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const updateCartCount = () => {
      try {
        const cartData = localStorage.getItem('cart');
        const cart = cartData ? JSON.parse(cartData) : [];

        // Ensure cart is an array
        if (Array.isArray(cart)) {
          const count = cart.reduce((sum: number, item: any) => {
            return sum + (item?.quantity || 0);
          }, 0);
          setCartCount(count);
        } else {
          // If cart is not an array, reset it
          localStorage.setItem('cart', '[]');
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        localStorage.setItem('cart', '[]');
        setCartCount(0);
      }
    };

    updateCartCount();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateCartCount();
    };
    window.addEventListener('storage', handleStorageChange);

    // Custom event for cart updates
    window.addEventListener('cartUpdate', updateCartCount);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdate', updateCartCount);
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.user-dropdown')) {
        setIsUserDropdownOpen(false);
      }
      if (!target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
      if (!target.closest('.search-suggestions') && !target.closest('input[type="text"]')) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Read search query from URL on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      if (query) {
        setSearchQuery(query);
      }
    }
  }, []);

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());

      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      if (selectedSubcategory !== 'all') {
        params.set('subcategory', selectedSubcategory);
      }

      router.push(`/search?${params.toString()}`);
      setSearchQuery(''); // Clear search after regular form submission
      setShowSearchSuggestions(false); // Hide suggestions
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion); // Update the search box display
    setShowSearchSuggestions(false); // Hide suggestions immediately

    // Navigate immediately with the suggestion text
    if (suggestion.trim()) {
      const params = new URLSearchParams();
      params.set('q', suggestion.trim());

      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      if (selectedSubcategory !== 'all') {
        params.set('subcategory', selectedSubcategory);
      }

      router.push(`/search?${params.toString()}`);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('all'); // Reset subcategory when category changes
    setIsCategoryDropdownOpen(false);
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setIsCategoryDropdownOpen(false);
  };

  const categories = [
    {
      id: 'all',
      name: 'All',
      icon: '🛍️',
      subcategories: []
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: '📱',
      subcategories: [
        { id: 'mobiles', name: 'Mobile Phones' },
        { id: 'laptops', name: 'Laptops' },
        { id: 'tablets', name: 'Tablets' },
        { id: 'headphones', name: 'Headphones' },
        { id: 'cameras', name: 'Cameras' },
        { id: 'smartwatches', name: 'Smart Watches' },
        { id: 'gaming', name: 'Gaming' },
        { id: 'accessories', name: 'Accessories' }
      ]
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: '👕',
      subcategories: [
        { id: 'mens-clothing', name: "Men's Clothing" },
        { id: 'womens-clothing', name: "Women's Clothing" },
        { id: 'footwear', name: 'Footwear' },
        { id: 'bags', name: 'Bags & Wallets' },
        { id: 'watches', name: 'Watches' },
        { id: 'jewelry', name: 'Jewelry' },
        { id: 'sunglasses', name: 'Sunglasses' }
      ]
    },
    {
      id: 'home-kitchen',
      name: 'Home & Kitchen',
      icon: '🏠',
      subcategories: [
        { id: 'furniture', name: 'Furniture' },
        { id: 'appliances', name: 'Appliances' },
        { id: 'cookware', name: 'Cookware' },
        { id: 'decor', name: 'Home Decor' },
        { id: 'bedding', name: 'Bedding' },
        { id: 'lighting', name: 'Lighting' },
        { id: 'storage', name: 'Storage' }
      ]
    },
    {
      id: 'beauty-health',
      name: 'Beauty & Health',
      icon: '💄',
      subcategories: [
        { id: 'skincare', name: 'Skin Care' },
        { id: 'makeup', name: 'Makeup' },
        { id: 'haircare', name: 'Hair Care' },
        { id: 'fragrances', name: 'Fragrances' },
        { id: 'personal-care', name: 'Personal Care' },
        { id: 'wellness', name: 'Wellness' },
        { id: 'healthcare', name: 'Healthcare' }
      ]
    },
    {
      id: 'sports-outdoors',
      name: 'Sports & Outdoors',
      icon: '⚽',
      subcategories: [
        { id: 'fitness', name: 'Fitness Equipment' },
        { id: 'clothing', name: 'Sports Clothing' },
        { id: 'footwear', name: 'Sports Footwear' },
        { id: 'accessories', name: 'Sports Accessories' },
        { id: 'outdoor-gear', name: 'Outdoor Gear' },
        { id: 'cycling', name: 'Cycling' },
        { id: 'team-sports', name: 'Team Sports' }
      ]
    },
    {
      id: 'toys-games',
      name: 'Toys & Games',
      icon: '🎮',
      subcategories: [
        { id: 'educational-toys', name: 'Educational Toys' },
        { id: 'action-figures', name: 'Action Figures' },
        { id: 'board-games', name: 'Board Games' },
        { id: 'puzzles', name: 'Puzzles' },
        { id: 'dolls', name: 'Dolls & Playsets' },
        { id: 'outdoor-toys', name: 'Outdoor Toys' },
        { id: 'video-games', name: 'Video Games' }
      ]
    },
    {
      id: 'books-media',
      name: 'Books & Media',
      icon: '📚',
      subcategories: [
        { id: 'fiction', name: 'Fiction Books' },
        { id: 'non-fiction', name: 'Non-Fiction' },
        { id: 'educational', name: 'Educational' },
        { id: 'music', name: 'Music' },
        { id: 'movies', name: 'Movies & TV' },
        { id: 'audiobooks', name: 'Audiobooks' },
        { id: 'magazines', name: 'Magazines' }
      ]
    },
  ];

  const mainCategories = [
    { id: 'electronics', name: 'Electronics', icon: '📱', color: 'bg-blue-500' },
    { id: 'fashion', name: 'Fashion', icon: '👗', color: 'bg-pink-500' },
    { id: 'home-kitchen', name: 'Home', icon: '🏠', color: 'bg-green-500' },
    { id: 'beauty-health', name: 'Beauty', icon: '💄', color: 'bg-orange-500-muted' },
    { id: 'sports-outdoors', name: 'Sports', icon: '⚽', color: 'bg-orange-500' },
    { id: 'toys-games', name: 'Toys', icon: '🎮', color: 'bg-red-500' },
    { id: 'automotive', name: 'Automotive', icon: '🚗', color: 'bg-gray-600' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-gray-50 py-1 border-b border-gray-200">
        <div className="container">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="hidden xs:block">Deliver to</span>
              <span className="font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 transition-colors">
                {pincode ? `${city} ${pincode}` : 'Select Location'}
              </span>
              <button
                onClick={() => {
                  // Force show pincode modal
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('showPincodeModal'));
                  }
                }}
                className="text-primary hover:text-orange-600 text-xs ml-1 sm:ml-2 underline whitespace-nowrap flex-shrink-0"
              >
                {pincode ? 'Change' : 'Set Location'}
              </button>
            </div>
            <div className="hidden sm:flex gap-3 lg:gap-4 flex-shrink-0">
              <Link href="/help" className="hover:text-orange-600 transition-colors whitespace-nowrap">Customer Service</Link>
              <Link href="/gift-cards" className="hover:text-orange-600 transition-colors whitespace-nowrap">Gift Cards</Link>
              <Link href="/sell" className="hover:text-orange-600 transition-colors whitespace-nowrap">Sell</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white py-2">
        <div className="container">
          {/* Mobile Layout - Stacked */}
          <div className="flex lg:hidden flex-col gap-3">
            {/* Top Row: Logo + Actions */}
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo.svg"
                    alt="MarketHub Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>

              {/* Right Actions */}
              <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>

                <Link href="/cart" className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors group relative">
                  <div className="relative user-dropdown">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">Cart</span>
                </Link>

                <div className="relative user-dropdown">
                  <button
                    onClick={() => isAuthenticated ? setIsUserDropdownOpen(!isUserDropdownOpen) : showAuthModal('signin')}
                    className="hidden sm:flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors group"
                  >
                    <User className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-xs mt-1 text-center">
                      {isAuthenticated ?
                        (user?.name || `User${user?.phone?.slice(-4) || ''}`) :
                        'Sign In'
                      }
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && isAuthenticated && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                      <div className="py-2 border-b border-gray-100">
                        <div className="px-4 py-2">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.name || `User${user?.phone?.slice(-4) || ''}`}
                          </p>
                          <p className="text-xs text-gray-500">+91 {user?.phone}</p>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>Wishlist</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="relative">
              <form onSubmit={handleSearch}>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Category Dropdown - Mobile */}
                <div className="relative category-dropdown">
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors rounded-l-lg min-w-[80px] sm:min-w-[130px]"
                  >
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      {categories.find(c => c.id === selectedCategory)?.icon || '🛍️'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 hidden xs:block">
                      {categories.find(c => c.id === selectedCategory)?.name || 'All'}
                    </span>
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Category Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1">
                      <div className="py-2 max-h-64 overflow-y-auto">
                        {categories.map((category) => (
                          <div key={category.id}>
                            <button
                              onClick={() => handleCategorySelect(category.id)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left font-medium"
                            >
                              <span className="text-base">{category.icon}</span>
                              <span className="text-sm text-gray-700">{category.name}</span>
                            </button>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div className="bg-gray-50 border-t border-gray-100">
                                {category.subcategories.map((subcategory) => (
                                  <button
                                    key={subcategory.id}
                                    onClick={() => handleSubcategorySelect(subcategory.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-left text-xs text-gray-600"
                                  >
                                    <span className="w-4"></span>
                                    <span>{subcategory.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input - Mobile */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                  onFocus={() => setIsCategoryDropdownOpen(false)}
                  placeholder="Search products..."
                  className="flex-1 px-3 sm:px-5 py-2 sm:py-3 text-gray-700 placeholder-gray-500 focus:outline-none text-sm sm:text-base"
                />

                {/* Search Button - Mobile */}
                <button type="submit" className="px-3 sm:px-7 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 rounded-r-lg">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              </form>

              {/* Search Suggestions */}
              {searchQuery && showSearchSuggestions && (
                <div className="search-suggestions absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
                  <div className="p-3 sm:p-4">
                    <div className="text-sm text-gray-500 mb-2">Popular suggestions</div>
                    <div className="space-y-2">
                      <div
                        onClick={() => handleSuggestionClick('iPhone 15 Pro Max')}
                        className="text-sm text-gray-700 hover:text-orange-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded"
                      >
                        iPhone 15 Pro Max
                      </div>
                      <div
                        onClick={() => handleSuggestionClick('Nike Air Max')}
                        className="text-sm text-gray-700 hover:text-orange-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded"
                      >
                        Nike Air Max
                      </div>
                      <div
                        onClick={() => handleSuggestionClick('Sony Headphones')}
                        className="text-sm text-gray-700 hover:text-orange-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded"
                      >
                        Sony Headphones
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden lg:flex items-center gap-6 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center group flex-shrink-0">
              <div className="relative w-24 h-24 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.svg"
                  alt="MarketHub Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Search Bar with Category Dropdown - Desktop */}
            <div className="flex-1 min-w-0 max-w-3xl xl:max-w-5xl relative">
              <form onSubmit={handleSearch}>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Category Dropdown */}
                  <div className="relative category-dropdown">
                    <button
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors rounded-l-lg min-w-[130px]"
                    >
                      <span className="text-gray-700 font-medium">
                        {categories.find(c => c.id === selectedCategory)?.icon || '🛍️'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {categories.find(c => c.id === selectedCategory)?.name || 'All'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Category Dropdown Menu */}
                    {isCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1">
                        <div className="py-2 max-h-64 overflow-y-auto">
                          {categories.map((category) => (
                            <div key={category.id}>
                              <button
                                onClick={() => handleCategorySelect(category.id)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left font-medium"
                              >
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-sm text-gray-700">{category.name}</span>
                              </button>
                              {category.subcategories && category.subcategories.length > 0 && (
                                <div className="bg-gray-50 border-t border-gray-100">
                                  {category.subcategories.map((subcategory) => (
                                    <button
                                      key={subcategory.id}
                                      onClick={() => handleSubcategorySelect(subcategory.id)}
                                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-left text-xs text-gray-600"
                                    >
                                      <span className="w-4"></span>
                                      <span>{subcategory.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                    onFocus={() => setIsCategoryDropdownOpen(false)}
                    placeholder="Search for products, brands, and more..."
                    className="flex-1 px-5 py-3 text-gray-700 placeholder-gray-500 focus:outline-none"
                  />

                  {/* Search Button */}
                  <button type="submit" className="px-7 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 rounded-r-lg">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                </form>

                {/* Search Suggestions */}
                {searchQuery && showSearchSuggestions && (
                  <div className="search-suggestions absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
                    <div className="p-4">
                      <div className="text-sm text-gray-500 mb-2">Popular suggestions</div>
                      <div className="space-y-2">
                        <div
                          onClick={() => handleSuggestionClick('iPhone 15 Pro Max')}
                          className="text-sm text-gray-700 hover:text-orange-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded"
                        >
                          iPhone 15 Pro Max
                        </div>
                        <div
                          onClick={() => handleSuggestionClick('Nike Air Max')}
                          className="text-sm text-gray-700 hover:text-orange-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded"
                        >
                          Nike Air Max
                        </div>
                        <div
                          onClick={() => handleSuggestionClick('Sony Headphones')}
                          className="text-sm text-gray-700 hover:text-orange-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded"
                        >
                          Sony Headphones
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 flex-shrink-0 ml-auto">
              <div className="relative user-dropdown">
                <button
                  onClick={() => isAuthenticated ? setIsUserDropdownOpen(!isUserDropdownOpen) : showAuthModal('signin')}
                  className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors group"
                >
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs mt-1 text-center">
                    {isAuthenticated ?
                      (user?.name || `User${user?.phone?.slice(-4) || ''}`) :
                      'Sign In'
                    }
                  </span>
                </button>

                {/* User Dropdown Menu - Desktop */}
                {isUserDropdownOpen && isAuthenticated && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="py-2 border-b border-gray-100">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || `User${user?.phone?.slice(-4) || ''}`}
                        </p>
                        <p className="text-xs text-gray-500">+91 {user?.phone}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>Wishlist</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/cart" className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors group relative">
                <div className="relative user-dropdown">
                  <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="bg-white border-t border-gray-200">
        <div className="container">
          <nav className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 py-1 overflow-x-auto scrollbar-hide">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="px-2 sm:px-3 py-1 rounded hover:bg-gray-50 transition-colors whitespace-nowrap group flex-shrink-0"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="container px-2 sm:px-3 md:px-4 py-4">
            {/* Mobile Menu Categories */}
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 ${category.color} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0`}>
                    {category.icon}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 truncate">{category.name}</span>
                </Link>
              ))}
            </nav>

            {/* Additional Mobile Menu Links */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAuthenticated) {
                    logout();
                  } else {
                    showAuthModal('signin');
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {isAuthenticated ? 'Sign Out' : 'Sign In'}
                </span>
              </button>
              <Link
                href="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">Customer Service</span>
              </Link>
              <Link
                href="/gift-cards"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">Gift Cards</span>
              </Link>
              <Link
                href="/sell"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">Sell</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={hideAuthModal}
        mode={authMode}
      />
    </header>
  );
};

export default Header;