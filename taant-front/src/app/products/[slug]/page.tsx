'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Truck, Shield, RefreshCw, Minus, Plus, ChevronLeft, ChevronRight, Search, X, ZoomIn, Check, AlertCircle, Zap, Share2 } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { getProductBySlug as getProductBySlugAPI, getRelatedProducts as getRelatedProductsAPI, transformProductForFrontend } from '@/api/products';
import { useLocation } from '@/contexts/LocationContext';


interface Review {
  id: string;
  customer: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  images: string[];
  helpful: number;
}

interface BrowsingHistoryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

// Fallback products function
const getFallbackProducts = () => [
  {
    id: 'fallback-1',
    name: 'Wireless Earbuds Pro',
    slug: 'wireless-earbuds-pro',
    price: 199.99,
    image: 'https://picsum.photos/seed/earbuds-pro/200/200.jpg',
    rating: 4.5,
    reviews: 234,
    originalPrice: 249.99
  },
  {
    id: 'fallback-2',
    name: 'Smart Watch Ultra',
    slug: 'smart-watch-ultra',
    price: 399.99,
    image: 'https://picsum.photos/seed/smart-watch/200/200.jpg',
    rating: 4.7,
    reviews: 567,
    originalPrice: null
  },
  {
    id: 'fallback-3',
    name: 'Portable Speaker',
    slug: 'portable-speaker',
    price: 89.99,
    image: 'https://picsum.photos/seed/speaker/200/200.jpg',
    rating: 4.3,
    reviews: 189,
    originalPrice: 119.99
  },
  {
    id: 'fallback-4',
    name: 'Phone Stand',
    slug: 'phone-stand',
    price: 29.99,
    image: 'https://picsum.photos/seed/phone-stand/200/200.jpg',
    rating: 4.6,
    reviews: 92,
    originalPrice: null
  }
];

const ProductDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewImages, setSelectedReviewImages] = useState<string[]>([]);
  const [selectedReviewImageIndex, setSelectedReviewImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set()); // No sections expanded by default
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [stockCount] = useState(14); // Fixed stock count
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [slug, setSlug] = useState<string>('');
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const [liveViewers, setLiveViewers] = useState(0);
  const [recentPurchase, setRecentPurchase] = useState<any>(null);
  const [addToCartAnimation, setAddToCartAnimation] = useState(false);
  const [buyNowAnimation, setBuyNowAnimation] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const { pincode, city } = useLocation();

  // Unwrap params promise and load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);

        // Fetch product data from API
        const apiProduct = await getProductBySlugAPI(resolvedParams.slug);
        if (apiProduct) {
          // Transform API data to frontend format
          const productData = transformProductForFrontend(apiProduct);
          setProduct(productData);

          // Temporarily skip related products to isolate issue
          setRelatedProducts([]);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      }
    };

    loadProduct();
  }, [params]);

  // Initialize selected color/variant on component mount
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedColor(product.variants[0]);
    }
  }, [product]);

  // Scroll detection for sticky footer
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const addToCartRect = addToCartRef.current.getBoundingClientRect();
        const hasPassedAddToCart = addToCartRect.bottom < 0;
        setShowStickyFooter(hasPassedAddToCart);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live activity simulation
  useEffect(() => {
    // Generate random live viewers count
    const generateLiveViewers = () => {
      const base = Math.floor(Math.random() * 50) + 20; // 20-70 base viewers
      const trending = product?.badge === 'Best Seller' ? Math.floor(Math.random() * 30) + 10 : 0; // Extra for trending
      setLiveViewers(base + trending);
    };

    // Generate recent purchase
    const generateRecentPurchase = () => {
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
      const names = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita'];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const timeAgo = Math.floor(Math.random() * 30) + 1; // 1-30 minutes ago

      setRecentPurchase({
        name: randomName,
        city: randomCity,
        timeAgo: timeAgo
      });
    };

    generateLiveViewers();
    generateRecentPurchase();

    // Update live viewers every 5-10 seconds
    const viewersInterval = setInterval(generateLiveViewers, Math.random() * 5000 + 5000);

    // Update recent purchase every 20-40 seconds
    const purchaseInterval = setInterval(generateRecentPurchase, Math.random() * 20000 + 20000);

    return () => {
      clearInterval(viewersInterval);
      clearInterval(purchaseInterval);
    };
  }, [product]);

  // Display only real variants from API
  const displayVariants = React.useMemo(() => {
    if (!product || !product.variants) return [];
    return product.variants;
  }, [product]);

  // Group and merge all variant options by key
  const groupedOptions = React.useMemo(() => {
    if (!product || !product.variants) return {};

    const optionsMap: { [key: string]: Set<string> } = {};

    // Get all active variants
    const activeVariants = product.variants.filter((variant: any) => variant.is_active);

    activeVariants.forEach((variant: any) => {
      if (!variant.options) return;

      variant.options.forEach((option: any) => {
        if (!option.name || !option.value || option.name.trim() === '' || option.value.trim() === '') return;

        if (!optionsMap[option.name]) {
          optionsMap[option.name] = new Set();
        }
        optionsMap[option.name].add(option.value);
      });
    });

    // Convert Sets to sorted arrays
    const result: { [key: string]: string[] } = {};
    Object.entries(optionsMap).forEach(([key, values]) => {
      result[key] = Array.from(values).sort();
    });

    return result;
  }, [product]);

  // Find variant that matches selected options
  const findMatchingVariant = React.useCallback((options: { [key: string]: string }) => {
    if (!product || !product.variants || Object.keys(options).length === 0) return null;

    const matchingVariant = product.variants.find((variant: any) => {
      if (!variant.is_active || !variant.options) return false;

      // Check if all selected options match this variant
      const selectedKeys = Object.keys(options);
      if (selectedKeys.length === 0) return false;

      return selectedKeys.every(key => {
        const variantHasOption = variant.options.some((opt: any) =>
          opt.name === key && opt.value === options[key]
        );
        return variantHasOption;
      });
    });

    return matchingVariant || null;
  }, [product]);

  // Get currently selected variant based on selected options
  const selectedVariant = React.useMemo(() => {
    return findMatchingVariant(selectedOptions);
  }, [selectedOptions, findMatchingVariant]);

  // Handle option selection
  const handleOptionSelect = (optionName: string, optionValue: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: optionValue
    }));
  };

  // Show loading state while fetching data
  if (!product) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const reviews: Review[] = [
    {
      id: '1',
      customer: 'Rahul Sharma',
      rating: 5,
      title: 'Absolutely Incredible Sound Quality!',
      content: 'I\'ve been using these headphones for 3 weeks now and I\'m completely blown away. The noise cancellation is incredible - I can\'t hear anything when they\'re on. The sound quality is crystal clear with deep bass and crisp highs. Highly recommend!',
      date: '2024-10-15',
      verified: true,
      images: [
        'https://picsum.photos/seed/review-headphones-1/400/400.jpg',
        'https://picsum.photos/seed/review-headphones-2/400/400.jpg'
      ],
      helpful: 45
    },
    {
      id: '2',
      customer: 'Priya Patel',
      rating: 4,
      title: 'Great headphones, but a bit expensive',
      content: 'The sound quality is amazing and they\'re very comfortable for long listening sessions. The battery life is excellent - I get about 30 hours of playback. My only complaint is the price, but you get what you pay for.',
      date: '2024-10-12',
      verified: true,
      images: [
        'https://picsum.photos/seed/review-headphones-3/400/400.jpg'
      ],
      helpful: 23
    },
    {
      id: '3',
      customer: 'Amit Kumar',
      rating: 5,
      title: 'Perfect for my daily commute',
      content: 'These headphones have transformed my daily train commute. The noise cancellation blocks out all the train noise and the comfort is unmatched. I can wear them for hours without any discomfort.',
      date: '2024-10-10',
      verified: true,
      images: [],
      helpful: 18
    }
  ];

  
  const browsingHistory: BrowsingHistoryItem[] = [
    {
      id: '8',
      name: 'Mechanical Keyboard RGB',
      price: 149.99,
      image: 'https://picsum.photos/seed/mechanical-keyboard/200/200.jpg',
      slug: 'mechanical-keyboard-rgb'
    },
    {
      id: '9',
      name: 'Gaming Mouse Pro',
      price: 89.99,
      image: 'https://picsum.photos/seed/gaming-mouse/200/200.jpg',
      slug: 'gaming-mouse-pro'
    },
    {
      id: '10',
      name: 'Monitor Light Bar',
      price: 69.99,
      image: 'https://picsum.photos/seed/monitor-light/200/200.jpg',
      slug: 'monitor-light-bar'
    },
  ];

  const currentPrice = selectedColor?.price || selectedVariant?.price || product.price;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images!.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
  };

  const openReviewImages = (images: string[], index: number = 0) => {
    setSelectedReviewImages(images);
    setSelectedReviewImageIndex(index);
    setShowReviewModal(true);
  };

  const nextReviewImage = () => {
    if (selectedReviewImageIndex < selectedReviewImages.length - 1) {
      setSelectedReviewImageIndex(selectedReviewImageIndex + 1);
    }
  };

  const prevReviewImage = () => {
    if (selectedReviewImageIndex > 0) {
      setSelectedReviewImageIndex(selectedReviewImageIndex - 1);
    }
  };

  const showSuccessMessageBox = (message: string) => {
    setNotificationMessage(message);
    setShowSuccessMessage(true);
    // Scroll to top to show the success message
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // No auto-hide - message stays until user closes it
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleAddToCart = () => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Get cart from localStorage or initialize empty array
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      const cartItem = {
        id: product.id,
        name: product.name,
        price: selectedColor?.price || product.price,
        image: product.images?.[0] || product.image,
        slug: product.slug,
        quantity: quantity,
        variant: selectedColor?.name || '',
        size: selectedSize,
        color: selectedColor?.color || '',
        timestamp: new Date().toISOString()
      };

      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex((item: any) =>
        item.id === product.id &&
        item.variant === cartItem.variant &&
        item.size === cartItem.size
      );

      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Trigger custom event to update header cart count
      window.dispatchEvent(new Event('cartUpdate'));

      showSuccessMessageBox(`✅ ${product.name} added to cart successfully!`);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout after a short delay
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1000);
  };

  const reviewStats = {
    average: product.rating,
    total: product.reviews,
    distribution: [
      { stars: 5, count: 623, percentage: 50 },
      { stars: 4, count: 374, percentage: 30 },
      { stars: 3, count: 187, percentage: 15 },
      { stars: 2, count: 50, percentage: 4 },
      { stars: 1, count: 13, percentage: 1 },
    ]
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Success Message Box */}
      {showSuccessMessage && (
        <div className="bg-orange-500-light border-l-4 border-orange-500 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500-light0 rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-orange-800">Success!</p>
              <p className="text-orange-800 text-sm">{notificationMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-orange-800-muted hover:text-orange-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="container py-2">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs mb-2">
          <Link href="/" className="text-gray-600 hover:text-orange-800-muted transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/category/electronics" className="text-gray-600 hover:text-orange-800-muted transition-colors">
            Electronics
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Product Images with Zoom - Sticky on Desktop */}
          <div className="flex gap-3 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:z-10 lg:transition-all lg:duration-300 hover:lg:shadow-lg">
            {/* Thumbnail Gallery - Left Side */}
            <div className="flex flex-col gap-1 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] lg:pr-1">
              {product.images?.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square w-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? 'border-orange-500 ring-1 ring-orange-200 scale-105'
                      : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 lg:flex-1">
              <div
                ref={imageContainerRef}
                className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-200"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <ImageWithFallback
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className={`w-full h-full object-cover ${isZoomed ? 'scale-150' : 'scale-100'} transition-transform duration-200`}
                  style={{
                    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                  }}
                />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all duration-200 z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all duration-200 z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/90 p-2 rounded-full">
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-3">
            {/* Title and Rating */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
                  {product.brand && (
                    <p className="text-sm text-gray-600 mb-1">Brand: <span className="font-medium">{product.brand}</span></p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isWishlisted
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: product.description,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-900">{product.rating}</span>
                </div>
                <span className="text-gray-600 text-sm">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
                <div className="flex items-center text-orange-800-muted text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  <span>{product.reviews} verified purchases</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 border-b border-gray-200 pb-3">
              <span className="text-2xl font-bold text-gray-900">
                ₹{Math.round(currentPrice).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{Math.round(product.originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
              <div className="text-orange-800-muted text-xs font-medium">
                Inclusive of all taxes
              </div>
            </div>

            {/* Product Short Description */}
            {product.short_description && (
              <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {product.short_description}
                </p>
              </div>
            )}

            {/* Product Variants */}
            {displayVariants && displayVariants.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Variants:</h3>
                <div className="flex flex-wrap gap-0">
                  {displayVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedColor(variant);
                        setSelectedOptions({}); // Clear all selected options when switching variants
                      }}
                      disabled={!variant.inStock}
                      className={`relative group transition-all duration-200 rounded border-2 overflow-hidden w-14 h-18 ${
                        !variant.inStock ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        selectedColor?.id === variant.id
                          ? 'border-orange-500 ring-1 ring-orange-200 scale-105'
                          : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={variant.image || product.image}
                          alt={variant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-1 bg-white">
                        <h4 className="text-[8px] font-medium text-gray-900 truncate leading-tight">{variant.name}</h4>
                        <p className="text-[8px] font-bold text-orange-800-muted leading-tight">
                          ₹{Math.round(variant.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                      {selectedColor?.id === variant.id && (
                        <div className="absolute top-1 right-1 bg-orange-500-light0 rounded-full p-0.5">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                      {!variant.inStock && (
                        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                          <span className="text-white text-[6px] font-medium">Out of Stock</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Options - Show only selected variant's options */}
            {selectedColor && selectedColor.options && selectedColor.options.length > 0 && (
              <div className="space-y-4">
                {(() => {
                  // Normalize option names and group options by key
                  const groupedOptions: { [key: string]: string[] } = {};

                  selectedColor.options
                    .filter((option: any) => option.name && option.value && option.value.trim() !== '')
                    .forEach((option: any) => {
                      // Normalize option name: capitalize first letter, lowercase rest
                      const normalizedName = option.name.charAt(0).toUpperCase() + option.name.slice(1).toLowerCase();

                      if (!groupedOptions[normalizedName]) {
                        groupedOptions[normalizedName] = [];
                      }
                      groupedOptions[normalizedName].push(option.value);
                    });

                  return Object.entries(groupedOptions).map(([optionName, optionValues]) => {
                    // If only one option exists for this key, display as text instead of buttons
                    const hasSingleOption = optionValues.length === 1;
                    const uniqueValues = [...new Set(optionValues)]; // Remove duplicates

                    return (
                      <div key={optionName}>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          {optionName}:
                          <span className="font-normal text-sm text-gray-600 ml-1">
                            {selectedOptions[optionName] || (hasSingleOption ? optionValues[0] : 'Select option')}
                          </span>
                        </h3>

                        {/* Only show as clickable buttons if multiple options exist */}
                        {!hasSingleOption && (
                          <div className="flex flex-wrap gap-2">
                            {uniqueValues.map((optionValue, index) => {
                              const isSelected = selectedOptions[optionName] === optionValue;
                              return (
                                <button
                                  key={`${optionName}-${index}`}
                                  onClick={() => setSelectedOptions(prev => ({
                                    ...prev,
                                    [optionName]: optionValue
                                  }))}
                                  className={`px-3 py-2 border-2 rounded text-sm font-medium transition-all duration-200 relative overflow-hidden group ${
                                    isSelected
                                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-500"></div>
                                  <span className="relative z-10 capitalize">{optionValue}</span>
                                  {isSelected && (
                                    <Check className="w-3 h-3 inline-block ml-1 text-orange-600" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quantity:</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center font-semibold border border-gray-300 rounded-lg py-2 text-sm"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-orange-800 font-medium text-sm">In Stock</span>
              <span className="text-orange-600 text-xs">• Only {stockCount} left</span>
            </div>

            {/* Estimated Delivery Time */}
            {pincode && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Estimated Delivery: Tomorrow - {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-600">to {city} ({pincode})</p>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div ref={addToCartRef}>
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-md hover:shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                <ShoppingBag className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Add to Cart</span>
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-md hover:shadow-lg relative overflow-hidden group mt-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                <Zap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Buy Now</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 text-xs">Free Delivery</p>
                  <p className="text-xs text-gray-600">Within 3-5 days</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 text-xs">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% Secure</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 text-xs">Easy Returns</p>
                  <p className="text-xs text-gray-600">7 days policy</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            {product.faqs && product.faqs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {product.faqs.map((faq: any, index: number) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleSection(`faq-${index}`)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-medium text-gray-900 text-sm">{faq.question}</h3>
                        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has(`faq-${index}`) ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedSections.has(`faq-${index}`) && (
                        <div className="px-3 pb-3 text-xs text-gray-700 border-t border-gray-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details Section */}
            <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Product Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-50 font-medium text-gray-900 w-1/3">Brand</td>
                      <td className="py-3 px-4 text-gray-700">{product.brand || 'Premium Audio'}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-50 font-medium text-gray-900">Model Number</td>
                      <td className="py-3 px-4 text-gray-700">ATH-WHP500</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-50 font-medium text-gray-900">Connectivity</td>
                      <td className="py-3 px-4 text-gray-700">Bluetooth 5.0, 3.5mm jack</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-50 font-medium text-gray-900">Battery Life</td>
                      <td className="py-3 px-4 text-gray-700">Up to 30 hours</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-50 font-medium text-gray-900">Noise Cancellation</td>
                      <td className="py-3 px-4 text-gray-700">Active Noise Cancelling (ANC)</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-50 font-medium text-gray-900">Weight</td>
                      <td className="py-3 px-4 text-gray-700">254 grams</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      
    {/* Similar Products Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Products</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-3">
              {(relatedProducts.length > 0 ? relatedProducts.slice(0, 4) : getFallbackProducts()).map((relatedProduct) => (
                <div key={relatedProduct.id} className="flex-shrink-0 w-48">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
                    <Link href={`/products/${relatedProduct.slug}`}>
                      <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-gray-100">
                        <ImageWithFallback
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1 hover:text-orange-800-muted transition-colors text-sm line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(relatedProduct.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({relatedProduct.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{Math.round(relatedProduct.price).toLocaleString('en-IN')}
                        </span>
                        {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{Math.round(relatedProduct.originalPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* A+ Content Section - Amazon Style */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          {/* A+ Content Block 1 - Image Left, Text Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://picsum.photos/seed/headphones-lifestyle/600/400.jpg"
                alt="Premium headphones in use"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience Premium Sound Quality</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Immerse yourself in crystal-clear audio with our premium headphones. Custom-tuned 40mm drivers deliver deep, powerful bass and crisp, detailed highs that bring your music to life.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Whether you're listening to your favorite tracks, watching movies, or taking calls, experience audio the way it was meant to be heard. Our advanced acoustic engineering ensures every note is reproduced with stunning clarity and precision.
              </p>
            </div>
          </div>

          {/* A+ Content Block 2 - Text Left, Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Noise Cancellation</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Block out the world and focus on what matters. Our industry-leading Active Noise Cancellation (ANC) technology eliminates ambient noise, creating a sanctuary of sound wherever you are.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Perfect for busy commutes, noisy offices, or simply finding your quiet space. Switch between transparency mode and full noise cancellation with a simple touch, staying aware of your surroundings when needed.
              </p>
            </div>
            <div>
              <img
                src="https://picsum.photos/seed/noise-cancellation/600/400.jpg"
                alt="Noise cancellation technology"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* A+ Content Block 3 - Image Left, Text Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://picsum.photos/seed/comfort-design/600/400.jpg"
                alt="Comfortable headphones design"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All-Day Comfort</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Designed for extended wear, our headphones feature premium memory foam ear cushions and a lightweight, adjustable headband. Enjoy hours of comfortable listening without fatigue.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The ergonomic design distributes weight evenly, while soft, breathable materials keep you comfortable even during long listening sessions. Perfect for work, travel, or relaxation.
              </p>
            </div>
          </div>

          {/* A+ Content Block 4 - Text Left, Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Extended Battery Life</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Keep the music playing all day long with up to 30 hours of continuous playback on a single charge. Our efficient power management ensures you're never without your favorite tunes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Quick charge technology gives you hours of playback with just minutes of charging. The included carrying case protects your headphones and provides additional power on the go.
              </p>
            </div>
            <div>
              <img
                src="https://picsum.photos/seed/battery-life/600/400.jpg"
                alt="Long battery life indicator"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
          <div className="text-gray-700">
            <p className="mb-4">{product.description}</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-800 mt-1">•</span>
                  <span>Premium 40mm drivers deliver exceptional sound quality with deep bass and crystal-clear highs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-800 mt-1">•</span>
                  <span>Industry-leading Active Noise Cancellation blocks out ambient noise for immersive listening</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-800 mt-1">•</span>
                  <span>Up to 30 hours of battery life with quick charge support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-800 mt-1">•</span>
                  <span>Memory foam ear cushions provide premium comfort for extended wear</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

          {/* Product Information - Two Column Layout */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Product Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Item Details */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('item-details')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Item details</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('item-details') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('item-details') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Brand</td>
                          <td className="py-2 text-gray-700">{product.brand || 'Premium Audio'}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Model</td>
                          <td className="py-2 text-gray-700">ATH-WHP500</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Color</td>
                          <td className="py-2 text-gray-700">Multiple colors</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Material</td>
                          <td className="py-2 text-gray-700">Premium plastic/metal</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Design */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('design')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Design</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('design') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('design') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Style</td>
                          <td className="py-2 text-gray-700">Over-ear</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Fit</td>
                          <td className="py-2 text-gray-700">Adjustable headband</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Weight</td>
                          <td className="py-2 text-gray-700">254 grams</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Dimensions</td>
                          <td className="py-2 text-gray-700">18 x 16 x 8 cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('controls')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Controls</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('controls') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('controls') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Touch</td>
                          <td className="py-2 text-gray-700">Yes</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Voice</td>
                          <td className="py-2 text-gray-700">Siri/Google</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Playback</td>
                          <td className="py-2 text-gray-700">Play/pause, volume</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Mic</td>
                          <td className="py-2 text-gray-700">Noise-cancelling</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Battery */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('battery')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Battery</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('battery') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('battery') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Life</td>
                          <td className="py-2 text-gray-700">30 hours</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Charge</td>
                          <td className="py-2 text-gray-700">2.5 hours</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Quick</td>
                          <td className="py-2 text-gray-700">15 min = 3 hours</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Port</td>
                          <td className="py-2 text-gray-700">USB-C</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Audio */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('audio')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Audio</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('audio') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('audio') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Driver</td>
                          <td className="py-2 text-gray-700">40mm</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Freq</td>
                          <td className="py-2 text-gray-700">20Hz - 20kHz</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Imp</td>
                          <td className="py-2 text-gray-700">32 Ohms</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Sens</td>
                          <td className="py-2 text-gray-700">105dB</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Codecs</td>
                          <td className="py-2 text-gray-700">SBC, AAC, aptX</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Connectivity */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('connectivity')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Connectivity</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('connectivity') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('connectivity') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Bluetooth</td>
                          <td className="py-2 text-gray-700">5.0</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Range</td>
                          <td className="py-2 text-gray-700">10 meters</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">3.5mm</td>
                          <td className="py-2 text-gray-700">Yes</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Multi</td>
                          <td className="py-2 text-gray-700">2 devices</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('additional-details')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Additional</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('additional-details') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('additional-details') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Warranty</td>
                          <td className="py-2 text-gray-700">1 year</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Box</td>
                          <td className="py-2 text-gray-700">HPs, case, cables</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Compat</td>
                          <td className="py-2 text-gray-700">iOS, Android, Win, Mac</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Made</td>
                          <td className="py-2 text-gray-700">China</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Style */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('style')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Style</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('style') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('style') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Finish</td>
                          <td className="py-2 text-gray-700">Matte premium</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Colors</td>
                          <td className="py-2 text-gray-700">Black, Silver, Blue, Rose</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Look</td>
                          <td className="py-2 text-gray-700">Modern minimal</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Users</td>
                          <td className="py-2 text-gray-700">Music lovers, pros</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Measurements */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('measurements')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Measurements</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('measurements') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('measurements') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Band</td>
                          <td className="py-2 text-gray-700">3.5cm</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Cup</td>
                          <td className="py-2 text-gray-700">10cm</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Cable</td>
                          <td className="py-2 text-gray-700">1.2m</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Case</td>
                          <td className="py-2 text-gray-700">20 x 18 x 10 cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Case Battery */}
              <div className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSection('case-battery')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 text-sm">Case Battery</h3>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.has('case-battery') ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections.has('case-battery') && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900 w-1/3">Cap</td>
                          <td className="py-2 text-gray-700">600mAh</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Charges</td>
                          <td className="py-2 text-gray-700">2 full charges</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">Method</td>
                          <td className="py-2 text-gray-700">USB-C</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">LED</td>
                          <td className="py-2 text-gray-700">Status lights</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* More Related Products */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">More Products You'll Love</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-3">
              {(relatedProducts.length > 0 ? relatedProducts : getFallbackProducts()).map((relatedProduct) => (
                <div key={relatedProduct.id} className="flex-shrink-0 w-56">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
                    <Link href={`/products/${relatedProduct.slug}`}>
                      <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                        <ImageWithFallback
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          width={256}
                          height={256}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 hover:text-orange-800-muted transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(relatedProduct.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({relatedProduct.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{Math.round(relatedProduct.price).toLocaleString('en-IN')}
                        </span>
                        {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{Math.round(relatedProduct.originalPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {relatedProduct.badge && (
                        <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mt-2">
                          {relatedProduct.badge}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section with Stats */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>

            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{product.rating}</div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{product.reviews.toLocaleString()} verified ratings</p>
              </div>

              <div className="space-y-2">
                {reviewStats.distribution.map((stat) => (
                  <div key={stat.stars} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8">{stat.stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{review.customer}</span>
                        {review.verified && (
                          <div className="flex items-center text-orange-800-muted text-sm">
                            <Check className="w-4 h-4 mr-1" />
                            <span>Verified Purchase</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-3">{review.content}</p>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="mb-3">
                          <div className="flex gap-2">
                            {review.images.slice(0, 3).map((image, index) => (
                              <button
                                key={index}
                                onClick={() => openReviewImages(review.images, index)}
                                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-500 transition-colors"
                              >
                                <img
                                  src={image}
                                  alt={`Review image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                            {review.images.length > 3 && (
                              <button
                                onClick={() => openReviewImages(review.images, 3)}
                                className="flex-shrink-0 w-16 h-16 rounded-lg border border-gray-200 hover:border-orange-500 transition-colors flex items-center justify-center text-sm text-gray-600"
                              >
                                +{review.images.length - 3}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                  
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <button className="flex items-center gap-1 hover:text-orange-800-muted transition-colors">
                          <span>👍 Helpful ({review.helpful})</span>
                        </button>
                        <button className="hover:text-orange-800-muted transition-colors">Report</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Image Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Main Modal Image */}
            <div className="relative">
              <img
                src={selectedReviewImages[selectedReviewImageIndex]}
                alt={`Review image ${selectedReviewImageIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              {/* Navigation Arrows */}
              {selectedReviewImageIndex > 0 && (
                <button
                  onClick={prevReviewImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {selectedReviewImageIndex < selectedReviewImages.length - 1 && (
                <button
                  onClick={nextReviewImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
              {selectedReviewImages.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedReviewImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedReviewImageIndex
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

        {/* Related Products Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(relatedProducts.length > 0 ? relatedProducts : getFallbackProducts()).slice(0, 8).map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                <Link href={`/products/${relatedProduct.slug}`}>
                  <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-white">
                    <ImageWithFallback
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 hover:text-orange-800-muted transition-colors text-sm line-clamp-2">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(relatedProduct.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({relatedProduct.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Math.round(relatedProduct.price).toLocaleString('en-IN')}
                    </span>
                    {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                      <span className="text-xs text-gray-500 line-through">
                        ₹{Math.round(relatedProduct.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Sticky Footer Bar */}
      {showStickyFooter && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
          <div className="container px-2 sm:px-3 md:px-4 py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Live Activity Section */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Live Viewers */}
                <div className="flex items-center gap-2 bg-orange-500-light px-2 py-1 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-orange-500-light0 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-orange-800 whitespace-nowrap">
                    {liveViewers} watching
                  </span>
                </div>

                {/* Recent Purchase */}
                {recentPurchase && (
                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="font-medium">{recentPurchase.name}</span>
                    <span>bought from {recentPurchase.city}</span>
                    <span className="text-gray-400">• {recentPurchase.timeAgo} min ago</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setAddToCartAnimation(true);
                    handleAddToCart();
                    setTimeout(() => setAddToCartAnimation(false), 600);
                  }}
                  className={`bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base shadow-md hover:shadow-lg relative overflow-hidden group ${
                    addToCartAnimation ? 'scale-95' : 'scale-100'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10 hidden xs:inline">Add to Cart</span>
                  <span className="relative z-10 xs:hidden">Cart</span>
                </button>

                <button
                  onClick={() => {
                    setBuyNowAnimation(true);
                    handleBuyNow();
                    setTimeout(() => setBuyNowAnimation(false), 600);
                  }}
                  className={`bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base shadow-md hover:shadow-lg relative overflow-hidden group ${
                    buyNowAnimation ? 'scale-95' : 'scale-100'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">Buy Now</span>
                  <span className="relative z-10 sm:hidden">Buy</span>
                </button>
              </div>
            </div>

            {/* Mobile Purchase Info */}
            {recentPurchase && (
              <div className="mt-2 pt-2 border-t border-gray-100 sm:hidden">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">{recentPurchase.name}</span>
                  <span>bought from {recentPurchase.city}</span>
                  <span className="text-gray-400">• {recentPurchase.timeAgo} min ago</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;