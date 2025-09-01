import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    id: '',
    nic: '',
    phoneNumber: '',
    address: '',
    gmail: '',
    birthYear: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Simulate fetching user data (in a real app, this would come from an API)
  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    
    // Simulate loading user profile data
    const profileData = {
      name: userData.name || 'Kavishka R',
      age: '25',
      id: userData.id || 'EMP001',
      nic: '123456789V',
      phoneNumber: '+94 77 123 4567',
      address: '123 Construction Street, Colombo',
      gmail: userData.email || 'kavishka.r@gmail.com',
      birthYear: '1998'
    };
    
    setProfileData(profileData);
  }, []);

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
    
    if (!profileData.id.trim()) {
      newErrors.id = 'ID is required';
    }
    
    if (!profileData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (!/^[\d]{9}[vV]$|^[\d]{12}$/.test(profileData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number';
    }
    
    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!profileData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!profileData.gmail.trim()) {
      newErrors.gmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.gmail)) {
      newErrors.gmail = 'Please enter a valid email address';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Simulate saving profile data (in a real app, this would be an API call)
    console.log('Profile data saved:', profileData);
    
    // Update user data in localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    userData.name = profileData.name;
    userData.email = profileData.gmail;
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const profileData = {
      name: userData.name || 'Kavishka R',
      age: '25',
      id: userData.id || 'EMP001',
      nic: '123456789V',
      phoneNumber: '+94 77 123 4567',
      address: '123 Construction Street, Colombo',
      gmail: userData.email || 'kavishka.r@gmail.com',
      birthYear: '1998'
    };
    
    setProfileData(profileData);
    setErrors({});
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
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
              <label htmlFor="id" className="form-label">Employee ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={profileData.id}
                onChange={handleChange}
                className={`form-input ${errors.id ? 'error' : ''}`}
                placeholder="Enter your employee ID"
                disabled={!isEditing}
              />
              {errors.id && <span className="error-message">{errors.id}</span>}
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
            <label htmlFor="gmail" className="form-label">Email Address</label>
            <input
              type="email"
              id="gmail"
              name="gmail"
              value={profileData.gmail}
              onChange={handleChange}
              className={`form-input ${errors.gmail ? 'error' : ''}`}
              placeholder="Enter your email address"
              disabled={!isEditing}
            />
            {errors.gmail && <span className="error-message">{errors.gmail}</span>}
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
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;