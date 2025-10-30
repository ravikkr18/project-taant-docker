'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100">
      {/* Back to Top */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container px-4">
          <div className="flex items-center justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Get to Know Us */}
            <div>
              <h4 className="text-base font-semibold mb-4">Get to Know Us</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
                    About MarketHub
                  </Link>
                </li>
                <li>
                  <Link href="/investors" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Investor Relations
                  </Link>
                </li>
                <li>
                  <Link href="/devices" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Devices
                  </Link>
                </li>
                <li>
                  <Link href="/science" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Science
                  </Link>
                </li>
              </ul>
            </div>

            {/* Make Money with Us */}
            <div>
              <h4 className="text-base font-semibold mb-4">Make Money with Us</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/sell" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Sell products on MarketHub
                  </Link>
                </li>
                <li>
                  <Link href="/sell-apps" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Sell apps on MarketHub
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Become an Affiliate
                  </Link>
                </li>
                <li>
                  <Link href="/advertise" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Advertise Your Products
                  </Link>
                </li>
                <li>
                  <Link href="/publish" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Self-Publish with Us
                  </Link>
                </li>
                <li>
                  <Link href="/business" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Become an Business Customer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment Products */}
            <div>
              <h4 className="text-base font-semibold mb-4">Payment Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/business-card" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Business Card
                  </Link>
                </li>
                <li>
                  <Link href="/shop-points" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Shop with Points
                  </Link>
                </li>
                <li>
                  <Link href="/reload" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Reload Your Balance
                  </Link>
                </li>
                <li>
                  <Link href="/currency" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Currency Converter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Let Us Help You */}
            <div>
              <h4 className="text-base font-semibold mb-4">Let Us Help You</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/account" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Your Account
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Your Orders
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Shipping Rates & Policies
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Returns & Replacements
                  </Link>
                </li>
                <li>
                  <Link href="/manage" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Manage Your Content and Devices
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Help
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Second Footer Row */}
      <div className="bg-gray-100 py-8">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Categories */}
            <div>
              <h4 className="text-base font-semibold mb-4">Shop By Category</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/category/electronics" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link href="/category/fashion" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Fashion
                  </Link>
                </li>
                <li>
                  <Link href="/category/home-kitchen" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Home & Kitchen
                  </Link>
                </li>
                <li>
                  <Link href="/category/beauty-health" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Beauty & Health
                  </Link>
                </li>
                <li>
                  <Link href="/category/sports-outdoors" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Sports & Outdoors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Programs & Features */}
            <div>
              <h4 className="text-base font-semibold mb-4">Programs & Features</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/prime" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Prime
                  </Link>
                </li>
                <li>
                  <Link href="/subscribe" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Subscribe & Save
                  </Link>
                </li>
                <li>
                  <Link href="/registry" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Gift Registry
                  </Link>
                </li>
                <li>
                  <Link href="/gift-cards" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Gift Cards
                  </Link>
                </li>
                <li>
                  <Link href="/fresh" className="text-gray-600 hover:text-orange-600 transition-colors">
                    MarketHub Fresh
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-base font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Shipping Information
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Track Your Order
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div>
              <h4 className="text-base font-semibold mb-4">Company Information</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Press Releases
                  </Link>
                </li>
                <li>
                  <Link href="/investors" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Investor Relations
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-100 py-6 border-t border-gray-200">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 1996-2024, MarketHub.com, Inc. or its affiliates
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/conditions" className="text-gray-600 hover:text-orange-600 transition-colors">
                Conditions of Use
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">
                Privacy Notice
              </Link>
              <Link href="/interest-ads" className="text-gray-600 hover:text-orange-600 transition-colors">
                Interest-Based Ads
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🇺🇸</span>
              <select className="bg-transparent border border-gray-400 rounded px-2 py-1 text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;