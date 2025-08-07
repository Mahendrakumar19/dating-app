import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    interests: '',
    major: '',
    year: '',
    location: '',
    age: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        bio: response.data.bio || '',
        interests: response.data.interests ? response.data.interests.join(', ') : '',
        major: response.data.major || '',
        year: response.data.year || '',
        location: response.data.location || '',
        age: response.data.age || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Convert interests string back to array
      const updateData = {
        ...formData,
        interests: formData.interests ? formData.interests.split(',').map(item => item.trim()) : []
      };

      const response = await axios.put('http://localhost:5000/api/user/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadFormData = new FormData();
    files.forEach(file => uploadFormData.append('photos', file));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/user/profile/photos', uploadFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(prev => ({ ...prev, photos: response.data.photos }));
      alert('Photos uploaded successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoIndex) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/user/profile/photos/${photoIndex}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => ({ ...prev, photos: response.data.photos }));
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Photo delete error:', error);
      alert('Failed to delete photo');
    }
  };

  const setMainPhoto = async (photoIndex) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/user/profile/photos/${photoIndex}/main`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => ({ ...prev, photos: response.data.photos }));
      alert('Main photo updated!');
    } catch (error) {
      console.error('Main photo update error:', error);
      alert('Failed to update main photo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="text-center text-white">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Add null check for user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="text-center text-white">
          <p className="text-xl">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-r from-purple-400 to-pink-400">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 text-white transition duration-200 border border-white rounded-lg hover:text-gray-200"
          >
            Back to Matches
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="text-white transition duration-200 hover:text-gray-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden bg-white shadow-2xl rounded-2xl">
          
          {/* Photo Section */}
          <div className="p-6 border-b">
            <h2 className="mb-4 text-2xl font-bold">Photos</h2>
            
            {/* Upload Button */}
            <div className="mb-4">
              <label className="px-4 py-2 text-white transition duration-200 bg-purple-500 rounded-lg cursor-pointer hover:bg-purple-600">
                {uploading ? 'Uploading...' : 'Upload Photos'}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">You can upload up to 5 photos</p>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {user?.photos?.map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={photo.url} 
                    alt={`Profile ${index + 1}`}
                    className="object-cover w-full h-32 rounded-lg"
                  />
                  {photo.isMain && (
                    <div className="absolute px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded top-2 left-2">
                      MAIN
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center space-x-2 transition-opacity duration-200 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
                    {!photo.isMain && (
                      <button 
                        onClick={() => setMainPhoto(index)}
                        className="px-2 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                      >
                        Set Main
                      </button>
                    )}
                    <button 
                      onClick={() => deletePhoto(index)}
                      className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {(!user?.photos || user.photos.length === 0) && (
                <div className="py-8 text-center text-gray-500 col-span-full">
                  <div className="mb-4 text-6xl">📸</div>
                  <p>No photos uploaded yet. Add some photos to make your profile stand out!</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              <button 
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows="4"
                    placeholder="Tell people about yourself..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Interests</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Separate with commas (e.g., reading, hiking, movies)"
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Major</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={formData.major}
                      onChange={(e) => setFormData({...formData, major: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Year</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    >
                      <option value="">Select Year</option>
                      <option value="Integrated">Integrated</option>
                      <option value="Junior">PG 1st</option>
                      <option value="Senior">PG 2nd</option>
                      <option value="Graduate">Graduate</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      min="18"
                      max="30"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="flex space-x-4">
                  <button 
                    type="submit"
                    className="px-6 py-3 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 text-white transition duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-gray-700">Basic Info</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}</p>
                      <p><span className="font-medium">Age:</span> {user?.age}</p>
                      <p><span className="font-medium">Email:</span> {user?.email}</p>
                      <p><span className="font-medium">Location:</span> {user?.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Academic Info</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Major:</span> {user?.major}</p>
                      <p><span className="font-medium">Year:</span> {user?.year}</p>
                    </div>
                  </div>
                </div>

                {user?.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-700">About Me</h3>
                    <p className="mt-2 text-gray-600">{user.bio}</p>
                  </div>
                )}

                {user?.interests && user.interests.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Interests</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 text-sm text-purple-600 bg-purple-100 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-700">Stats</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-center">
                    <div className="p-4 rounded-lg bg-purple-50">
                      <p className="text-2xl font-bold text-purple-600">{user?.matches?.length || 0}</p>
                      <p className="text-sm text-gray-600">Matches</p>
                    </div>
                    <div className="p-4 rounded-lg bg-pink-50">
                      <p className="text-2xl font-bold text-pink-600">{user?.photos?.length || 0}</p>
                      <p className="text-sm text-gray-600">Photos</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50">
                      <p className="text-2xl font-bold text-blue-600">{user?.likes?.length || 0}</p>
                      <p className="text-sm text-gray-600">Likes Given</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
