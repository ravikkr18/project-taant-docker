'use client';

import React, { useEffect, useState } from 'react';
import ProductSlider from '../ProductSlider';
import { apiService } from '@/services/api';
import { Product } from '@/types';
import { Timer, Zap, Tag } from 'lucide-react';

const DealsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const dealsProducts = await apiService.getDealsOfTheDay(8);
        setProducts(dealsProducts);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          return { ...prev, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { hours, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { hours: hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // Reset to next day
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-red-600 to-orange-600 py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Deal of the Day</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 animate-pulse">
                <div className="aspect-square bg-white/20 rounded-lg mb-2"></div>
                <div className="h-3 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      <div className="container relative">
        {/* Deals header with countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                💰 Deal of the Day
              </h2>
              <p className="text-sm text-white/90 mt-1">Massive savings on top products</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-white">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Ends in:</span>
              </div>
              <div className="flex gap-2 mt-1">
                {[
                  { value: String(timeLeft.hours).padStart(2, '0'), label: 'HRS' },
                  { value: String(timeLeft.minutes).padStart(2, '0'), label: 'MIN' },
                  { value: String(timeLeft.seconds).padStart(2, '0'), label: 'SEC' }
                ].map(({ value, label }, index) => (
                  <div key={index} className="bg-white/30 backdrop-blur-sm rounded px-2 py-1 text-center">
                    <div className="text-sm font-bold text-white">{value}</div>
                    <div className="text-xs text-white/80">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deals product slider */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-600">Limited Time Offers</span>
          </div>
          <ProductSlider title="" products={products} />
        </div>

        {/* Deals stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Savings', value: 'Up to 70%', icon: '💰' },
            { label: 'Items Sold', value: '12.5k+', icon: '🛍️' },
            { label: 'Happy Customers', value: '8.2k+', icon: '😊' },
            { label: 'New Deals', value: 'Every 6hrs', icon: '🔄' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/30">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xs font-semibold text-white">{stat.label}</div>
              <div className="text-sm font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Urgency message */}
        <div className="mt-6 bg-yellow-400/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
          <div className="flex items-center gap-2 text-yellow-100">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">⚡ Lightning Deals - Stock is limited and prices won't last!</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;