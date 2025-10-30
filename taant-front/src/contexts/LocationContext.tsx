'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
  pincode: string;
  city: string;
  setPincode: (pincode: string, city: string) => void;
  isPincodeSet: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [pincode, setPincodeState] = useState<string>('');
  const [city, setCityState] = useState<string>('');
  const [isPincodeSet, setIsPincodeSet] = useState<boolean>(false);

  // Load pincode from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPincode = localStorage.getItem('userPincode');
      const savedCity = localStorage.getItem('userCity');

      if (savedPincode && savedCity) {
        setPincodeState(savedPincode);
        setCityState(savedCity);
        setIsPincodeSet(true);
      }
    }
  }, []);

  const setPincode = (newPincode: string, newCity: string) => {
    setPincodeState(newPincode);
    setCityState(newCity);
    setIsPincodeSet(true);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPincode', newPincode);
      localStorage.setItem('userCity', newCity);
      localStorage.setItem('pincodeSet', 'true');
    }
  };

  const value: LocationContextType = {
    pincode,
    city,
    setPincode,
    isPincodeSet
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};