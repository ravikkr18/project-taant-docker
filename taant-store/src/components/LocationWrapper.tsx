'use client';

import { useState, useEffect } from 'react';
import PincodeModal from './PincodeModal';
import { LocationProvider, useLocation } from '@/contexts/LocationContext';

interface LocationWrapperProps {
  children: React.ReactNode;
}

function LocationWrapperContent({ children }: LocationWrapperProps) {
  const { isPincodeSet, setPincode } = useLocation();
  const [showPincodeModal, setShowPincodeModal] = useState(false);

  // Check if user has already set pincode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pincodeSet = localStorage.getItem('pincodeSet');
      if (!pincodeSet) {
        // Show modal after a short delay to let page load
        setTimeout(() => {
          setShowPincodeModal(true);
        }, 1000);
      }
    }
  }, []);

  // Listen for custom events to show pincode modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleShowPincodeModal = () => {
        setShowPincodeModal(true);
      };

      window.addEventListener('showPincodeModal', handleShowPincodeModal);

      return () => {
        window.removeEventListener('showPincodeModal', handleShowPincodeModal);
      };
    }
  }, []);

  const handlePincodeSelect = (pincodeValue: string, cityValue: string) => {
    setPincode(pincodeValue, cityValue);
    setShowPincodeModal(false);
  };

  const handleCloseModal = () => {
    setShowPincodeModal(false);
    // Still show modal later if user closes without selecting
    if (!isPincodeSet) {
      setTimeout(() => {
        setShowPincodeModal(true);
      }, 5000);
    }
  };

  return (
    <>
      <PincodeModal
        isOpen={showPincodeModal}
        onClose={handleCloseModal}
        onPincodeSelect={handlePincodeSelect}
      />
      {children}
    </>
  );
}

export default function LocationWrapper({ children }: LocationWrapperProps) {
  return (
    <LocationProvider>
      <LocationWrapperContent>{children}</LocationWrapperContent>
    </LocationProvider>
  );
}