'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { phone: string; name?: string }) => void;
  mode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, mode = 'signin' }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Auto-focus next input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  // Handle backspace in OTP inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  // Handle phone input
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    // Simulate API call - generate demo OTP
    setTimeout(() => {
      const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(demoOtp);
      setStep('otp');
      setIsLoading(false);
      startResendTimer();

      // Show OTP in console for demo (in production, this would be sent via SMS)
      console.log(`Demo OTP for ${phoneNumber}: ${demoOtp}`);
    }, 1500);
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (enteredOtp === generatedOtp) {
        setStep('success');
        setTimeout(() => {
          onSuccess({ phone: phoneNumber, name: 'User' + phoneNumber.slice(-4) });
          closeModal();
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
        // Show the demo OTP in error for testing
        setError(`Invalid OTP. Demo OTP: ${generatedOtp}`);
      }
      setIsLoading(false);
    }, 1000);
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(demoOtp);
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
      startResendTimer();
      console.log(`New Demo OTP for ${phoneNumber}: ${demoOtp}`);
    }, 1500);
  };

  // Close modal and reset state
  const closeModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendTimer(0);
    onClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {step === 'phone' && (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {mode === 'signup'
                      ? 'Sign up to get started with exclusive offers'
                      : 'Sign in to access your account and orders'
                    }
                  </p>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Secure OTP Authentication</span>
                </div>

                {/* Form */}
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="mt-1 text-xs text-red-600">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length !== 10}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Demo Mode:</strong> OTP will be shown in browser console
                  </p>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
                  <p className="text-gray-600 text-sm">
                    We've sent a 6-digit code to +91 {phoneNumber.slice(0, 5)}XXXXX
                  </p>
                </div>

                {/* OTP Input */}
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={1}
                        pattern="[0-9]"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="text-center">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </form>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-sm text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendTimer > 0 ? (
                      <>
                        <Clock className="w-4 h-4 inline mr-1" />
                        Resend OTP in {resendTimer}s
                      </>
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>

                {/* Change Number */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => setStep('phone')}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Change mobile number
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mode === 'signup' ? 'Account Created!' : 'Welcome Back!'}
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  {mode === 'signup'
                    ? 'Your account has been created successfully'
                    : 'You have been signed in successfully'
                  }
                </p>
                <div className="w-8 h-1 bg-green-500 rounded-full mx-auto animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;