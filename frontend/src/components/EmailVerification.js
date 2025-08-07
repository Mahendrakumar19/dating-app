import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage('Email verified successfully! You can now log in.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-4">Verifying Email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <a href="/" className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200">
              Go to Login
            </a>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <a href="/" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200">
              Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
