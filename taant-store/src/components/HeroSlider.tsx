'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageWithFallback from './ImageWithFallback';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/big-billion-days/1920/600.jpg',
      alt: 'Big Billion Days',
      title: '🛍️ Big Billion Days',
      subtitle: 'Up to 80% OFF on Electronics',
      buttonText: 'Shop Now',
      bgColor: 'from-purple-600 to-pink-600'
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/fashion-fiesta/1920/600.jpg',
      alt: 'Fashion Fiesta',
      title: '👗 Fashion Fiesta',
      subtitle: 'Trendy Styles Starting at ₹299',
      buttonText: 'Explore Collection',
      bgColor: 'from-pink-500 to-orange-500'
    },
    {
      id: 3,
      image: 'https://picsum.photos/seed/home-makeover/1920/600.jpg',
      alt: 'Home Makeover',
      title: '🏠 Home Makeover',
      subtitle: 'Transform Your Space',
      buttonText: 'Discover Deals',
      bgColor: 'from-green-600 to-teal-600'
    },
    {
      id: 4,
      image: 'https://picsum.photos/seed/gaming-zone/1920/600.jpg',
      alt: 'Gaming Zone',
      title: '🎮 Gaming Zone',
      subtitle: 'Consoles & Accessories',
      buttonText: 'Level Up Gaming',
      bgColor: 'from-blue-600 to-indigo-600'
    },
    {
      id: 5,
      image: 'https://picsum.photos/seed/sports-sale/1920/600.jpg',
      alt: 'Sports Sale',
      title: '⚡ Sports Sale',
      subtitle: 'Gear Up for Adventure',
      buttonText: 'Shop Sports',
      bgColor: 'from-orange-600 to-red-600'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-32 sm:h-40 md:h-64 lg:h-80 overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background image with gradient overlay */}
            <div className="relative w-full h-full">
              <ImageWithFallback
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-40`}></div>
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-xl">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/95 mb-4 sm:mb-6 drop-shadow">
                    {slide.subtitle}
                  </p>
                  <button className="bg-white text-gray-900 hover:bg-gray-100 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-lg">
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-200 z-10"
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-200 z-10"
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;