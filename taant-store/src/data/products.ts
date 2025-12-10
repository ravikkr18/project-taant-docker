import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Apple iPhone 15 Pro Max',
    slug: 'apple-iphone-15-pro-max',
    description: 'Latest iPhone with titanium design and A17 Pro chip. Features a stunning 6.7-inch Super Retina XDR display, professional camera system, and all-day battery life.',
    price: 1199.99,
    originalPrice: 1399.99,
    image: 'https://picsum.photos/seed/iphone-15-pro-max/800/800.jpg',
    images: [
      'https://picsum.photos/seed/iphone-15-pro-max/800/800.jpg',
      'https://picsum.photos/seed/iphone-15-pro-max-side/800/800.jpg',
      'https://picsum.photos/seed/iphone-15-pro-max-back/800/800.jpg',
      'https://picsum.photos/seed/iphone-15-pro-max-box/800/800.jpg',
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    badge: 'Best Seller',
    brand: 'Apple',
    sku: 'IP15PM256',
    variants: [
      { id: '1', name: 'Natural Titanium', price: 1199.99, inStock: true, color: '#F5E6D3' },
      { id: '2', name: 'Blue Titanium', price: 1199.99, inStock: true, color: '#4A90E2' },
      { id: '3', name: 'White Titanium', price: 1199.99, inStock: true, color: '#F8F8F8' },
      { id: '4', name: 'Black Titanium', price: 1199.99, inStock: true, color: '#1C1C1E' },
    ],
    weight: 221,
    dimensions: { length: 159.9, width: 76.7, height: 8.25 }
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality, premium comfort, and up to 30 hours of battery life.',
    price: 379.99,
    originalPrice: 449.99,
    image: 'https://picsum.photos/seed/sony-headphones/800/800.jpg',
    images: [
      'https://picsum.photos/seed/sony-headphones/800/800.jpg',
      'https://picsum.photos/seed/sony-headphones-side/800/800.jpg',
      'https://picsum.photos/seed/sony-headphones-detail/800/800.jpg',
      'https://picsum.photos/seed/sony-headphones-case/800/800.jpg',
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    rating: 4.7,
    reviews: 892,
    inStock: true,
    badge: 'Top Rated',
    brand: 'Sony',
    sku: 'WH1000XM5',
    variants: [
      { id: '1', name: 'Midnight Black', price: 379.99, inStock: true, color: '#1C1C1C' },
      { id: '2', name: 'Silver', price: 379.99, inStock: true, color: '#C0C0C0' },
      { id: '3', name: 'Midnight Blue', price: 379.99, inStock: true, color: '#1E3A8A' },
    ],
    weight: 250,
    dimensions: { length: 205, width: 180, height: 70 }
  },
  {
    id: '3',
    name: 'Nike Air Max 270',
    slug: 'nike-air-max-270',
    description: "Men's running shoes with Max Air unit for ultimate comfort and style. Features a large air bubble in the heel for responsive cushioning.",
    price: 149.99,
    originalPrice: 189.99,
    image: 'https://picsum.photos/seed/nike-air-max/800/800.jpg',
    images: [
      'https://picsum.photos/seed/nike-air-max/800/800.jpg',
      'https://picsum.photos/seed/nike-air-max-side/800/800.jpg',
      'https://picsum.photos/seed/nike-air-max-detail/800/800.jpg',
      'https://picsum.photos/seed/nike-air-max-box/800/800.jpg',
    ],
    category: 'Fashion',
    categoryId: 'fashion',
    rating: 4.5,
    reviews: 567,
    inStock: true,
    badge: '21% OFF',
    brand: 'Nike',
    sku: 'AIRMAX270',
    variants: [
      { id: '1', name: '7', price: 149.99, inStock: true },
      { id: '2', name: '8', price: 149.99, inStock: true },
      { id: '3', name: '9', price: 149.99, inStock: true },
      { id: '4', name: '10', price: 149.99, inStock: true },
      { id: '5', name: '11', price: 149.99, inStock: true },
    ],
    weight: 340,
    dimensions: { length: 30, width: 20, height: 10 }
  },
  {
    id: '4',
    name: 'Samsung 65" 4K QLED TV',
    slug: 'samsung-65-4k-qled-tv',
    description: 'Premium 4K QLED smart TV with HDR, Quantum Dot technology, and smart features. Experience vibrant colors and deep contrast.',
    price: 899.99,
    originalPrice: 1299.99,
    image: 'https://picsum.photos/seed/samsung-4k-tv/800/800.jpg',
    images: [
      'https://picsum.photos/seed/samsung-4k-tv/800/800.jpg',
      'https://picsum.photos/seed/samsung-4k-tv-side/800/800.jpg',
      'https://picsum.photos/seed/samsung-4k-tv-back/800/800.jpg',
      'https://picsum.photos/seed/samsung-4k-tv-remote/800/800.jpg',
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    rating: 4.6,
    reviews: 423,
    inStock: true,
    badge: '31% OFF',
    brand: 'Samsung',
    sku: 'QN65Q60B',
    weight: 21000,
    dimensions: { length: 1450, width: 830, height: 60 }
  },
  {
    id: '5',
    name: 'Dyson V15 Detect Vacuum',
    slug: 'dyson-v15-detect-vacuum',
    description: 'Cordless vacuum with laser dust detection technology. Reveals microscopic dust particles you can\'t normally see.',
    price: 699.99,
    image: 'https://picsum.photos/seed/dyson-vacuum/800/800.jpg',
    images: [
      'https://picsum.photos/seed/dyson-vacuum/800/800.jpg',
      'https://picsum.photos/seed/dyson-vacuum-angle/800/800.jpg',
      'https://picsum.photos/seed/dyson-vacuum-tools/800/800.jpg',
      'https://picsum.photos/seed/dyson-vacuum-charging/800/800.jpg',
    ],
    category: 'Home & Kitchen',
    categoryId: 'home-kitchen',
    rating: 4.7,
    reviews: 234,
    inStock: true,
    badge: 'New',
    brand: 'Dyson',
    sku: 'V15DETECT',
    variants: [
      { id: '1', name: 'Yellow/Gold', price: 699.99, inStock: true, color: '#FFD700' },
      { id: '2', name: 'Nickel', price: 699.99, inStock: true, color: '#C0C0C0' },
    ],
    weight: 2680,
    dimensions: { length: 250, width: 250, height: 1200 }
  },
  {
    id: '6',
    name: 'LEGO Creator Expert Bookshop',
    slug: 'lego-creator-expert-bookshop',
    description: 'Modular building set for adults. Create a charming bookshop with detailed interior and removable facade.',
    price: 179.99,
    image: 'https://picsum.photos/seed/lego-bookshop/800/800.jpg',
    images: [
      'https://picsum.photos/seed/lego-bookshop/800/800.jpg',
      'https://picsum.photos/seed/lego-bookshop-front/800/800.jpg',
      'https://picsum.photos/seed/lego-bookshop-interior/800/800.jpg',
      'https://picsum.photos/seed/lego-bookshop-box/800/800.jpg',
    ],
    category: 'Toys & Games',
    categoryId: 'toys-games',
    rating: 4.9,
    reviews: 156,
    inStock: true,
    badge: 'Exclusive',
    brand: 'LEGO',
    sku: '10270',
    weight: 1800,
    dimensions: { length: 480, width: 370, height: 70 }
  },
  {
    id: '7',
    name: 'Instant Pot Duo 7-in-1',
    slug: 'instant-pot-duo-7-in-1',
    description: 'Electric pressure cooker with multiple functions. Pressure cook, slow cook, rice cook, steam, sauté, and yogurt making.',
    price: 79.99,
    originalPrice: 119.99,
    image: 'https://picsum.photos/seed/instant-pot/800/800.jpg',
    images: [
      'https://picsum.photos/seed/instant-pot/800/800.jpg',
      'https://picsum.photos/seed/instant-pot-lid/800/800.jpg',
      'https://picsum.photos/seed/instant-pot-interior/800/800.jpg',
      'https://picsum.photos/seed/instant-pot-cooking/800/800.jpg',
    ],
    category: 'Home & Kitchen',
    categoryId: 'home-kitchen',
    rating: 4.6,
    reviews: 892,
    inStock: true,
    badge: '33% OFF',
    brand: 'Instant Pot',
    sku: 'DUO60',
    variants: [
      { id: '1', name: '3 Quart', price: 59.99, inStock: true },
      { id: '2', name: '6 Quart', price: 79.99, inStock: true },
      { id: '3', name: '8 Quart', price: 99.99, inStock: true },
    ],
    weight: 5400,
    dimensions: { length: 320, width: 310, height: 300 }
  },
  {
    id: '8',
    name: 'Theragun Prime Massager',
    slug: 'theragun-prime-massager',
    description: 'Percussive therapy massage gun for deep muscle treatment and recovery. Professional-grade device for home use.',
    price: 249.99,
    originalPrice: 299.99,
    image: 'https://picsum.photos/seed/theragun-massager/800/800.jpg',
    images: [
      'https://picsum.photos/seed/theragun-massager/800/800.jpg',
      'https://picsum.photos/seed/theragun-massager-angle/800/800.jpg',
      'https://picsum.photos/seed/theragun-massager-attachments/800/800.jpg',
      'https://picsum.photos/seed/theragun-massager-charging/800/800.jpg',
    ],
    category: 'Sports & Outdoors',
    categoryId: 'sports-outdoors',
    rating: 4.6,
    reviews: 890,
    inStock: true,
    badge: '17% OFF',
    brand: 'Theragun',
    sku: 'PRIME',
    variants: [
      { id: '1', name: 'Black', price: 249.99, inStock: true, color: '#1C1C1C' },
      { id: '2', name: 'White', price: 249.99, inStock: true, color: '#FFFFFF' },
    ],
    weight: 1100,
    dimensions: { length: 150, width: 60, height: 240 }
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getRelatedProducts(currentProduct: Product, limit: number = 6): Product[] {
  if (!currentProduct) return [];

  let related = products
    .filter(product => product.id !== currentProduct.id)
    .filter(product => product.categoryId === currentProduct.categoryId);

  // If not enough products in same category, add products from similar categories
  if (related.length < limit) {
    const otherCategories = ['electronics', 'fashion', 'home-kitchen', 'beauty-health', 'sports-outdoors'];
    const categoryPriority = otherCategories.filter(cat => cat !== currentProduct.categoryId);

    for (const category of categoryPriority) {
      const categoryProducts = products.filter(product =>
        product.id !== currentProduct.id &&
        product.categoryId === category
      );
      related = [...related, ...categoryProducts];
      if (related.length >= limit) break;
    }
  }

  return related.slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.brand?.toLowerCase().includes(lowercaseQuery)
  );
}