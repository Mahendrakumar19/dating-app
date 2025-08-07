import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const VerifyResult = () => {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verificationStatus = params.get('status');
    const verificationMessage = params.get('message');
    
    setStatus(verificationStatus);
    setMessage(verificationMessage || 'Verification complete');
    setLoading(false);
  }, [location]);

  const handleGoToLogin = () => {
    window.location.href = '/';
  };

  const handleResendEmail = () => {
    // You can implement resend email functionality here
    alert('Please check your email for a new verification link');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="text-center text-white">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-xl">Processing verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-purple-400 to-pink-400">
      <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl">
        
        {/* Header Section */}
        <div className={`text-center py-8 px-6 ${
          status === 'success' 
            ? 'bg-gradient-to-r from-green-400 to-green-500' 
            : 'bg-gradient-to-r from-red-400 to-red-500'
        }`}>
          <div className="mb-4 text-white">
            {status === 'success' ? (
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white rounded-full bg-opacity-20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white rounded-full bg-opacity-20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
            <h1 className="text-2xl font-bold sm:text-3xl">
              {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8">
          {status === 'success' ? (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="mb-4 text-6xl">🎉</div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome to University Dating!
                </h2>
                <p className="leading-relaxed text-gray-600">
                  {message || 'Your email has been successfully verified. You can now log in and start finding your perfect match!'}
                </p>
              </div>

              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Your account is now active and ready to use!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleGoToLogin}
                  className="w-full px-6 py-3 font-semibold text-white transition duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
                >
                  Continue to Login
                </button>
                
                <p className="text-sm text-gray-500">
                  Ready to find your perfect match? Let's get started!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="mb-4 text-6xl">😔</div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Oops! Something went wrong
                </h2>
                <p className="leading-relaxed text-gray-600">
                  {message || 'We couldn\'t verify your email. The link may be invalid or expired.'}
                </p>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      Don't worry, you can try again or request a new verification email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleGoToLogin}
                  className="w-full px-6 py-3 font-semibold text-white transition duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
                >
                  Go to Login
                </button>
                
                <button 
                  onClick={handleResendEmail}
                  className="w-full px-6 py-3 font-semibold text-gray-700 transition duration-300 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  Request New Verification Email
                </button>
                
                <p className="text-sm text-gray-500">
                  Need help? Contact our support team.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>UoH Dating</span>
            <span>•</span>
            <span>Find Your Perfect Match</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResult;