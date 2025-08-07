import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await axios.get('http://localhost:5000/api/user/potential-matches', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error loading matches. Please try again.');
      setLoading(false);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
  };

  const handleAction = async (action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/user/action', {
        targetUserId: matches[currentMatch]._id,
        action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.match) {
        alert('🎉 It\'s a match! You can now start chatting!');
      }

      // Move to next match
      setCurrentMatch(currentMatch + 1);
    } catch (error) {
      console.error('Error:', error);
      setError('Action failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Navigation Header Component with responsive design
  const NavigationHeader = () => (
    <div className="nav-header">
      <h1 className="nav-title">University Dating</h1>
      <div className="nav-buttons">
        <button 
          onClick={() => window.location.href = '/matches'}
          className="nav-button"
        >
          <span>💕</span>
          <span>Matches</span>
        </button>
        <button 
          onClick={() => window.location.href = '/messages'}
          className="nav-button"
        >
          <span>💬</span>
          <span>Messages</span>
        </button>
        <button 
          onClick={() => window.location.href = '/profile'}
          className="nav-button"
        >
          <span>👤</span>
          <span>Profile</span>
        </button>
        <button 
          onClick={handleLogout}
          className="nav-button logout"
        >
          Logout
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-r from-pink-400 to-red-400">
        <NavigationHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center text-white">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
            <p className="text-xl">Finding your perfect matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-r from-red-400 to-pink-400">
        <NavigationHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Oops!</h2>
            <p className="mb-6 text-xl">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 font-medium text-red-500 transition duration-200 bg-white rounded-lg hover:bg-gray-100"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0 || currentMatch >= matches.length) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-r from-blue-500 to-purple-500">
        <NavigationHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center text-white">
            <div className="mb-4 text-6xl">💔</div>
            <h2 className="mb-4 text-3xl font-bold">No more matches!</h2>
            <p className="mb-6 text-xl">Check back later for new potential matches</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 font-medium text-purple-500 transition duration-200 bg-white rounded-lg hover:bg-gray-100"
              >
                Refresh
              </button>
              <button
                onClick={() => window.location.href = '/matches'}
                className="px-6 py-3 font-medium text-white transition duration-200 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-purple-500"
              >
                View Matches
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const match = matches[currentMatch];

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-r from-pink-400 to-red-400">
      <NavigationHeader />

      {/* Match Counter */}
      <div className="mb-4 text-center">
        <p className="text-sm text-white sm:text-lg">
          {currentMatch + 1} of {matches.length} potential matches
        </p>
      </div>

      {/* Match Card */}
      <div className="flex items-center justify-center px-2 sm:px-4">
        <div className="match-card">
          {/* Photo Section */}
          <div className="match-photo">
            {match.photos && match.photos.length > 0 ? (
              <img
                src={match.photos[0].url}
                alt={match.firstName}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="text-center">
                <div className="mb-2 text-6xl sm:text-8xl">👤</div>
                <p className="text-sm text-gray-500 sm:text-base">No photo available</p>
              </div>
            )}

            {/* Age badge */}
            <div className="age-badge">
              <span>{match.age}</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-4 sm:p-6">
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl">
                {match.firstName} {match.lastName}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3 space-x-2 text-xs text-gray-600 sm:space-x-4 sm:text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded-full sm:px-3">{match.year}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full sm:px-3">{match.major}</span>
              </div>
            </div>

            {match.bio && (
              <div className="mb-4 sm:mb-6">
                <p className="text-sm italic text-center text-gray-700 sm:text-base">"{match.bio}"</p>
              </div>
            )}

            {match.interests && match.interests.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h4 className="mb-2 text-xs font-semibold text-center text-gray-600 sm:text-sm">Interests:</h4>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {match.interests.slice(0, 4).map((interest, index) => (
                    <span key={index} className="px-2 py-1 text-xs text-pink-600 bg-pink-100 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={() => handleAction('dislike')}
                className="action-button dislike"
              >
                <span>❌</span>
                <span className="hidden sm:inline">Pass</span>
              </button>

              <button
                onClick={() => handleAction('like')}
                className="action-button like"
              >
                <span>💖</span>
                <span className="hidden sm:inline">Like</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 mt-4 text-center sm:mt-6">
        <p className="text-xs text-white opacity-75 sm:text-sm">
          Swipe or click the buttons to find your perfect match!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;