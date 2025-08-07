import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const response = await axios.get('http://localhost:5000/api/user/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Matches fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      setLoading(false);
    }
  };

  const formatLastActive = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInHours = Math.floor((now - lastActiveDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Active ${diffInDays}d ago`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Navigation Header Component
  const NavigationHeader = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:gap-4 sm:mb-6">
      <h1 className="text-lg font-bold text-white sm:text-2xl lg:text-3xl">Your Matches</h1>
      <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-4">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white transition duration-200 border border-white rounded-md sm:gap-2 sm:px-3 lg:px-4 sm:py-2 sm:text-sm hover:bg-white hover:text-pink-500"
        >
          <span>🔍</span>
          <span className="hidden sm:inline">Find More</span>
        </button>
        <button
          onClick={() => window.location.href = '/messages'}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white transition duration-200 border border-white rounded-md sm:gap-2 sm:px-3 lg:px-4 sm:py-2 sm:text-sm hover:bg-white hover:text-pink-500"
        >
          <span>💬</span>
          <span className="hidden sm:inline">Messages</span>
        </button>
        <button
          onClick={() => window.location.href = '/profile'}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white transition duration-200 border border-white rounded-md sm:gap-2 sm:px-3 lg:px-4 sm:py-2 sm:text-sm hover:bg-white hover:text-pink-500"
        >
          <span>👤</span>
          <span className="hidden sm:inline">Profile</span>
        </button>
        <button
          onClick={handleLogout}
          className="px-1 text-xs text-white transition duration-200 hover:text-gray-200 sm:px-2 sm:text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-r from-pink-400 to-red-400 sm:p-4">
        <NavigationHeader />
        <div className="flex items-center justify-center flex-1 min-h-[60vh]">
          <div className="text-center text-white">
            <div className="w-6 h-6 mx-auto mb-3 border-b-2 border-white rounded-full sm:w-12 sm:h-12 sm:mb-4 animate-spin"></div>
            <p className="text-sm sm:text-lg lg:text-xl">Loading your matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-r from-pink-400 to-red-400 sm:p-4">
      <NavigationHeader />

      <div className="mx-auto max-w-7xl">
        {matches.length === 0 ? (
          <div className="text-center text-white min-h-[50vh] flex items-center justify-center">
            <div className="px-3">
              <div className="mb-3 text-3xl sm:mb-6 sm:text-6xl lg:text-8xl">💔</div>
              <h2 className="mb-2 text-lg font-bold sm:mb-4 sm:text-2xl lg:text-3xl">No matches yet!</h2>
              <p className="mb-3 text-xs sm:mb-6 sm:text-lg lg:text-xl opacity-90">Keep swiping to find your perfect match</p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-3 py-2 text-xs font-semibold text-pink-500 transition duration-200 bg-white rounded-lg shadow-lg sm:px-6 lg:px-8 sm:py-3 sm:text-base hover:bg-gray-100"
              >
                Start Matching
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 text-center sm:mb-6">
              <p className="text-xs text-white sm:text-lg lg:text-xl opacity-90">
                🎉 You have {matches.length} amazing match{matches.length !== 1 ? 'es' : ''}!
              </p>
            </div>
            
            {/* Optimized Responsive Grid with Smaller Boxes for Mobile */}
            <div className="grid grid-cols-3 gap-1.5 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 sm:gap-2 lg:gap-3">
              {matches.map((match, index) => (
                <div 
                  key={match.userId._id || index} 
                  className="flex flex-col overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md sm:rounded-xl sm:shadow-lg hover:shadow-xl hover:scale-105 group"
                >
                  {/* Compact Square Photo Section */}
                  <div className="relative w-full overflow-hidden aspect-square">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
                      {match.userId.photos && match.userId.photos.length > 0 ? (
                        <img
                          src={match.userId.photos.find(p => p.isMain)?.url || match.userId.photos[0].url}
                          alt={match.userId.firstName}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="text-lg text-gray-400 sm:text-2xl lg:text-3xl">👤</div>
                      )}
                    </div>
                    
                    {/* Compact Activity Status Badge */}
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-0.5 sm:px-1 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full shadow-sm">
                      <span className="hidden text-xs lg:inline">{formatLastActive(match.userId.lastActive)}</span>
                      <span className="lg:hidden">●</span>
                    </div>
                    
                    {/* Compact Age Badge */}
                    <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 px-0.5 sm:px-1 py-0.5 text-xs font-semibold text-gray-800 bg-white bg-opacity-90 rounded-full shadow-sm">
                      {match.userId.age}
                    </div>

                    {/* Mobile Tap Overlay */}
                    <div 
                      className="absolute inset-0 flex items-end transition-all duration-300 bg-black bg-opacity-0 sm:group-hover:bg-opacity-20"
                      onClick={() => window.location.href = `/messages/${match.userId._id}`}
                    >
                      <div className="hidden w-full p-1 transition-transform duration-300 transform translate-y-full sm:p-2 sm:group-hover:translate-y-0 sm:block">
                        <button className="w-full py-1 text-xs font-semibold text-white transition-all duration-200 rounded-md shadow-md bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                          💬 Message
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ultra Compact Content Section */}
                  <div className="flex flex-col flex-1 min-h-0 p-1 sm:p-2">
                    <div className="flex-1 min-h-0">
                      <h3 className="mb-0.5 text-xs font-bold text-gray-800 truncate sm:text-sm lg:text-base">
                        {match.userId.firstName}
                      </h3>
                      
                      {/* Compact Tags - Only show on larger mobile and up */}
                      <div className="hidden gap-0.5 mb-1 xs:flex xs:flex-col sm:flex-row sm:gap-1">
                        <span className="px-1 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 rounded truncate">
                          {match.userId.major?.substring(0, 8)}{match.userId.major?.length > 8 ? '...' : ''}
                        </span>
                        <span className="px-1 py-0.5 text-xs font-medium text-pink-600 bg-pink-100 rounded truncate">
                          {match.userId.year}
                        </span>
                      </div>

                      {/* Interests - Only show on tablet and up */}
                      {match.userId.interests && match.userId.interests.length > 0 && (
                        <div className="hidden gap-0.5 mb-1 md:flex">
                          {match.userId.interests.slice(0, 1).map((interest, idx) => (
                            <span key={idx} className="px-1 py-0.5 text-xs text-blue-600 bg-blue-100 rounded truncate max-w-full">
                              {interest.length > 6 ? interest.substring(0, 6) + '...' : interest}
                            </span>
                          ))}
                          {match.userId.interests.length > 1 && (
                            <span className="text-xs text-gray-500">+{match.userId.interests.length - 1}</span>
                          )}
                        </div>
                      )}

                      {/* Match date - Only show on desktop */}
                      <div className="hidden text-xs text-gray-500 lg:block">
                        💕 {new Date(match.matchedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Button - Always visible on mobile, more compact */}
                    <button
                      onClick={() => window.location.href = `/messages/${match.userId._id}`}
                      className="w-full py-1 mt-1 text-xs font-semibold text-white transition-all duration-200 rounded shadow-md sm:hidden bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    >
                      💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Matches;