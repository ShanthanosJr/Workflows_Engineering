import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    employeeId: '',
    nic: '',
    phoneNumber: '',
    address: '',
    email: '',
    birthYear: '',
    avatar: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user token from localStorage (stable reference)
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Fetch user profile data (stable reference for useEffect)
  const fetchProfile = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get('http://localhost:5050/api/users/profile', config);
      const userData = response.data;
      
      setProfileData({
        name: userData.name || '',
        age: userData.age || '',
        employeeId: userData.employeeId || '',
        nic: userData.nic || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        email: userData.email || '',
        birthYear: userData.birthYear || '',
        avatar: userData.avatar || ''
      });
      
      if (userData.avatar) {
        setAvatarPreview(`http://localhost:5050${userData.avatar}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile data');
    }
  }, [getToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.age) {
      newErrors.age = 'Age is required';
    } else if (!/^\d+$/.test(profileData.age) || parseInt(profileData.age) < 18 || parseInt(profileData.age) > 100) {
      newErrors.age = 'Please enter a valid age (18-100)';
    }
    
    if (!profileData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!profileData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (!/^[\d]{9}[vV]$|^[\d]{12}$/.test(profileData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number';
    }
    
    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[0-9\s\-()]+$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!profileData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!profileData.birthYear) {
      newErrors.birthYear = 'Birth year is required';
    } else if (!/^\d{4}$/.test(profileData.birthYear) || 
               parseInt(profileData.birthYear) < 1900 || 
               parseInt(profileData.birthYear) > new Date().getFullYear()) {
      newErrors.birthYear = 'Please enter a valid birth year';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      // Prepare form data
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('age', profileData.age);
      formData.append('employeeId', profileData.employeeId);
      formData.append('nic', profileData.nic);
      formData.append('phoneNumber', profileData.phoneNumber);
      formData.append('address', profileData.address);
      formData.append('email', profileData.email);
      formData.append('birthYear', profileData.birthYear);
      
      // Only append avatar if it's a file (not a string URL)
      if (profileData.avatar && typeof profileData.avatar !== 'string') {
        formData.append('avatar', profileData.avatar);
      }

      const response = await axios.put('http://localhost:5050/api/users/profile', formData, config);
      
      // Update user data in localStorage
      const userData = {
        name: response.data.name,
        email: response.data.email,
        id: response.data._id,
        avatar: response.data.avatar
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.data.token);
      
      // Update avatar preview if a new one was uploaded
      if (response.data.avatar) {
        setAvatarPreview(`http://localhost:5050${response.data.avatar}`);
      }
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    fetchProfile();
    setErrors({});
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        await axios.delete('http://localhost:5050/api/users/profile', config);
        
        // Clear user data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Redirect to sign in page
        window.location.href = '/signin';
        
        alert('Account deleted successfully');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Avatar section */}
          <div className="avatar-section">
            <div className="avatar-preview">
              <img 
                src={avatarPreview || 'https://via.placeholder.com/150/000000/FFFFFF?text=No+Image'} 
                alt="Profile" 
                className="avatar-image"
              />
            </div>
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="avatar" className="upload-label">
                  Change Profile Photo
                </label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="upload-input"
                />
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                disabled={!isEditing}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={profileData.age}
                onChange={handleChange}
                className={`form-input ${errors.age ? 'error' : ''}`}
                placeholder="Enter your age"
                disabled={!isEditing}
                min="18"
                max="100"
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeId" className="form-label">Employee ID</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={profileData.employeeId}
                onChange={handleChange}
                className={`form-input ${errors.employeeId ? 'error' : ''}`}
                placeholder="Enter your employee ID"
                disabled={!isEditing}
              />
              {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="nic" className="form-label">NIC Number</label>
              <input
                type="text"
                id="nic"
                name="nic"
                value={profileData.nic}
                onChange={handleChange}
                className={`form-input ${errors.nic ? 'error' : ''}`}
                placeholder="Enter your NIC number"
                disabled={!isEditing}
              />
              {errors.nic && <span className="error-message">{errors.nic}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleChange}
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                placeholder="Enter your phone number"
                disabled={!isEditing}
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="birthYear" className="form-label">Birth Year</label>
              <input
                type="number"
                id="birthYear"
                name="birthYear"
                value={profileData.birthYear}
                onChange={handleChange}
                className={`form-input ${errors.birthYear ? 'error' : ''}`}
                placeholder="Enter your birth year"
                disabled={!isEditing}
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.birthYear && <span className="error-message">{errors.birthYear}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
              disabled={!isEditing}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleChange}
              className={`form-input textarea ${errors.address ? 'error' : ''}`}
              placeholder="Enter your full address"
              disabled={!isEditing}
              rows="3"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>
          
          <div className="form-actions">
            {!isEditing ? (
              <button 
                type="button" 
                className="edit-button"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
            
            <button 
              type="button" 
              className="delete-button"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;