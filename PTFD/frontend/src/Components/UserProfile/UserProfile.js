import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState({
    name: 'Kavishka R',
    email: 'Kavishka.R@gmail.com',
    avatar: 'https://courseweb.sliit.lk/pluginfile.php/310596/user/icon/lambda/f1?rev=7824289'
  });

  const toggleProfile = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    // Implement sign out logic here
    console.log('User signed out');
    setIsOpen(false);
  };

  return (
    <div className="user-profile-container">
      <button 
        className="user-profile-button" 
        onClick={toggleProfile}
        aria-label="User profile"
        aria-expanded={isOpen}
      >
        <img 
          src={user.avatar} 
          alt="User avatar" 
          className="user-avatar"
        />
        <span className="user-name">{user.name}</span>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown">
          <div className="profile-header">
            <img 
              src={user.avatar} 
              alt="User avatar" 
              className="profile-avatar"
            />
            <div className="profile-info">
              <h4 className="profile-name">{user.name}</h4>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
          
          <div className="profile-welcome">
            <p className="welcome-text">Welcome back!</p>
          </div>
          
          <div className="profile-actions">
            <button className="profile-action-btn">
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