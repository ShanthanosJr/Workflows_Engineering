import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ inSidebar = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4514/4514759.png'
  });
  
  // Get user data from localStorage or use default
  const getUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        // Ensure avatar has a fallback if empty or null
        let avatar = parsedUserData.avatar || 'https://cdn-icons-png.flaticon.com/512/4514/4514759.png';
        
        // Handle relative avatar paths
        if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
          avatar = `http://localhost:5050${avatar}`;
        }
        
        return {
          ...parsedUserData,
          avatar: avatar
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return {
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: 'https://cdn-icons-png.flaticon.com/512/4514/4514759.png'
    };
  };

  // Update user data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUserData());
    };

    // Set initial user data
    setUser(getUserData());

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleProfile = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Update state immediately
    setUser({
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: 'https://cdn-icons-png.flaticon.com/512/4514/4514759.png'
    });
    console.log('User signed out');
    setIsOpen(false);
    // Redirect to sign in page
    navigate('/signin');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  return (
    <div className={`user-profile-container ${inSidebar ? 'sidebar-profile' : ''}`}>
      <button 
        className={`user-profile-button ${inSidebar ? 'sidebar-button' : ''}`} 
        onClick={toggleProfile}
        aria-label="User profile"
        aria-expanded={isOpen}
      >
        <img 
          src={user.avatar} 
          alt="User avatar" 
          className={`user-avatar ${inSidebar ? 'sidebar-avatar' : ''}`}
          onError={(e) => {
            e.target.src = 'https://cdn-icons-png.flaticon.com/512/4514/4514759.png';
          }}
        />
        <span className={`user-name ${inSidebar ? 'sidebar-name' : ''}`}>{user.name}</span>
      </button>

      {isOpen && (
        <div className={`user-profile-dropdown ${inSidebar ? 'sidebar-dropdown' : ''}`}>
          <div className="profile-header">
            <img 
              src={user.avatar} 
              alt="User avatar" 
              className="profile-avatar"
              onError={(e) => {
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/4514/4514759.png';
              }}
            />
            <div className="profile-info">
              <h4 className="profile-name">{user.name}</h4>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
          
          <div className="profile-welcome">
            <p className="welcome-text">Welcome back, {user.name}!</p>
          </div>
          
          <div className="profile-actions">
            <button className="profile-action-btn" onClick={handleProfileClick}>
              <span className="action-icon">👤</span>
              My Profile
            </button>
            <button className="profile-action-btn">
              <span className="action-icon">⚙️</span>
              Settings
            </button>
            <button className="profile-action-btn" onClick={handleSignOut}>
              <span className="action-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;