'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, X, Search } from 'lucide-react';

interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPincodeSelect: (pincode: string, city: string) => void;
}

const popularPincodes = [
  { pincode: '400001', city: 'Mumbai' },
  { pincode: '400002', city: 'Mumbai' },
  { pincode: '400003', city: 'Mumbai' },
  { pincode: '400004', city: 'Mumbai' },
  { pincode: '400005', city: 'Mumbai' },
  { pincode: '400006', city: 'Mumbai' },
  { pincode: '400007', city: 'Mumbai' },
  { pincode: '400008', city: 'Mumbai' },
  { pincode: '400009', city: 'Mumbai' },
  { pincode: '400010', city: 'Mumbai' },
  { pincode: '400011', city: 'Mumbai' },
  { pincode: '400012', city: 'Mumbai' },
  { pincode: '400013', city: 'Mumbai' },
  { pincode: '400014', city: 'Mumbai' },
  { pincode: '400015', city: 'Mumbai' },
  { pincode: '400016', city: 'Mumbai' },
  { pincode: '400017', city: 'Mumbai' },
  { pincode: '400018', city: 'Mumbai' },
  { pincode: '400019', city: 'Mumbai' },
  { pincode: '400020', city: 'Mumbai' },
  { pincode: '400021', city: 'Mumbai' },
  { pincode: '400022', city: 'Mumbai' },
  { pincode: '400023', city: 'Mumbai' },
  { pincode: '400024', city: 'Mumbai' },
  { pincode: '400025', city: 'Mumbai' },
  { pincode: '400026', city: 'Mumbai' },
  { pincode: '400027', city: 'Mumbai' },
  { pincode: '400028', city: 'Mumbai' },
  { pincode: '400029', city: 'Mumbai' },
  { pincode: '400030', city: 'Mumbai' },
];

const PincodeModal: React.FC<PincodeModalProps> = ({ isOpen, onClose, onPincodeSelect }) => {
  const [pincode, setPincode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredPincodes = popularPincodes.filter(
    (item) =>
      item.pincode.includes(searchTerm) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (pincode.length === 6) {
      setIsLoading(true);
      // Simulate API call to validate pincode
      setTimeout(() => {
        const selectedPincode = popularPincodes.find(item => item.pincode === pincode);
        if (selectedPincode) {
          onPincodeSelect(pincode, selectedPincode.city);
        } else {
          // For unknown pincodes, use a default city
          onPincodeSelect(pincode, 'Your Location');
        }
        setIsLoading(false);
        setPincode('');
        setSearchTerm('');
      }, 500);
    }
  };

  const handlePopularPincodeSelect = (pincodeValue: string, city: string) => {
    setPincode(pincodeValue);
    onPincodeSelect(pincodeValue, city);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Your Location</h2>
            <p className="text-sm text-gray-600 mt-1">Enter your pincode for accurate delivery</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={6}
              />
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {pincode.length === 6 && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Deliver to this pincode</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Popular Pincodes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pincodes</h3>

            {/* Search Filter */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pincode or city..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Popular Pincodes Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {filteredPincodes.slice(0, 20).map((item) => (
                <button
                  key={item.pincode}
                  onClick={() => handlePopularPincodeSelect(item.pincode, item.city)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.pincode}</div>
                      <div className="text-xs text-gray-600">{item.city}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            <MapPin className="w-3 h-3 inline mr-1" />
            We deliver to most locations. Enter your pincode for accurate delivery time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PincodeModal;