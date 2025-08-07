import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Discover', icon: '💖' },
    { path: '/matches', label: 'Matches', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="bg-white border-t shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-3 rounded-lg transition duration-200 ${
              location.pathname === item.path ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-pink-500'
            }`}
          >
            <span className="mb-1 text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center p-3 text-gray-600 transition duration-200 rounded-lg hover:text-red-500"
        >
          <span className="mb-1 text-2xl">🚪</span>
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;
