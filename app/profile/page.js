// app/profile/settings/page.js
"use client";

import { useState, useRef } from 'react';

export default function ProfileSettings() {
  const [currentUser, setCurrentUser] = useState({
    id: 'me',
    username: 'Makram Boukaiz',
    email: 'makram.boukaiz@example.com',
    displayName: 'Makram Boukaiz',
    avatar: '/avatars/makram.jpg',
    status: 'online',
    bio: 'Pong enthusiast and competitive player',
    location: 'Morocco',
    twoFactorEnabled: false,
    emailNotifications: true,
    soundEffects: true,
    darkMode: true,
    language: 'en',
    privacy: 'friends'
  });

  const [formData, setFormData] = useState(currentUser);
  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSave = () => {
    setCurrentUser(formData);
    setIsEditing(false);
    alert('Settings saved successfully!');
  };

  // Handle cancel editing
  const handleCancel = () => {
    setFormData(currentUser);
    setIsEditing(false);
  };

  // Handle avatar upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('avatar', e.target.result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    alert('Account deletion requested. This would normally redirect to confirmation process.');
    setShowDeleteConfirm(false);
  };

  // Get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return '';
    const names = username.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'game', label: 'Game Settings', icon: '🎮' }
  ];

  const renderAccountTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Account Information</h3>
      
      <div className="avatar-section">
        <div className="avatar-container">
          {formData.avatar ? (
            <img key={formData.avatar}
              src={formData.avatar} 
              alt="Profile Avatar" 
              className="profile-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="avatar-fallback" style={{ display: formData.avatar ? 'none' : 'flex' }}>
            {getUserInitials(formData.username)}
          </div>
        </div>
        <div className="avatar-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="file-input"
          />
          <div className="button-gradient">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-small"
            >
              Change Avatar
            </button>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Username</label>
          <div className="input-gradient">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="form-input"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Display Name</label>
          <div className="input-gradient">
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="form-input"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="input-gradient">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <div className="input-gradient">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-input"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group form-group-full">
          <label className="form-label">Bio</label>
          <div className="input-gradient">
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="form-textarea"
              disabled={!isEditing}
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="danger-zone">
        <h4 className="danger-title">Danger Zone</h4>
        <div className="danger-item">
          <div className="danger-info">
            <strong>Delete Account</strong>
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
          </div>
          <div className="button-gradient">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Privacy Settings</h3>
      
      <div className="form-group">
        <label className="form-label">Profile Visibility</label>
        <div className="select-gradient">
          <select
            value={formData.privacy}
            onChange={(e) => handleInputChange('privacy', e.target.value)}
            className="form-select"
            disabled={!isEditing}
          >
            <option value="public">Public - Anyone can see your profile</option>
            <option value="friends">Friends Only - Only friends can see your profile</option>
            <option value="private">Private - Only you can see your profile</option>
          </select>
        </div>
      </div>

      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Two-Factor Authentication</strong>
            <p>Add an extra layer of security to your account</p>
          </div>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="twoFactor"
              checked={formData.twoFactorEnabled}
              onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
              disabled={!isEditing}
            />
            <label htmlFor="twoFactor" className="toggle-label"></label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Notification Preferences</h3>
      
      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Email Notifications</strong>
            <p>Receive notifications about game invites and messages via email</p>
          </div>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={formData.emailNotifications}
              onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              disabled={!isEditing}
            />
            <label htmlFor="emailNotifications" className="toggle-label"></label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Appearance</h3>
      
      <div className="form-group">
        <label className="form-label">Language</label>
        <div className="select-gradient">
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="form-select"
            disabled={!isEditing}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Dark Mode</strong>
            <p>Use dark theme for better experience in low light</p>
          </div>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="darkMode"
              checked={formData.darkMode}
              onChange={(e) => handleInputChange('darkMode', e.target.checked)}
              disabled={!isEditing}
            />
            <label htmlFor="darkMode" className="toggle-label"></label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Game Settings</h3>
      
      <div className="toggle-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Sound Effects</strong>
            <p>Enable sound effects during gameplay</p>
          </div>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="soundEffects"
              checked={formData.soundEffects}
              onChange={(e) => handleInputChange('soundEffects', e.target.checked)}
              disabled={!isEditing}
            />
            <label htmlFor="soundEffects" className="toggle-label"></label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account': return renderAccountTab();
      case 'privacy': return renderPrivacyTab();
      case 'notifications': return renderNotificationsTab();
      case 'appearance': return renderAppearanceTab();
      case 'game': return renderGameTab();
      default: return renderAccountTab();
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="settings-container">
          {/* Settings Sidebar */}
          <div className="sidebar-gradient">
            <div className="sidebar solid-effect">
              <div className="sidebar-header">
                <h2 className="sidebar-title">Settings</h2>
              </div>
              <div className="settings-tabs">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="chat-area-gradient">
            <div className="chat-area solid-effect">
              <div className="settings-header">
                <div className="settings-header-content">
                  <h2 className="settings-title">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </h2>
                  <div className="settings-actions">
                    {!isEditing ? (
                      <div className="button-gradient">
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="btn"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="button-gradient">
                          <button 
                            onClick={handleCancel}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="button-gradient">
                          <button 
                            onClick={handleSave}
                            className="btn"
                          >
                            Save Changes
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="settings-content">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-gradient">
              <div className="modal solid-effect">
                <div className="modal-header">
                  <h3 className="modal-title">Delete Account</h3>
                </div>
                <div className="modal-content">
                  <p>Are you sure you want to delete your account? This action cannot be undone and will permanently delete:</p>
                  <ul className="delete-list">
                    <li>Your profile and account information</li>
                    <li>All game history and statistics</li>
                    <li>Tournament participation records</li>
                    <li>Chat messages and conversations</li>
                  </ul>
                  <p><strong>This action is irreversible.</strong></p>
                </div>
                <div className="modal-actions">
                  <div className="button-gradient">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="button-gradient">
                    <button 
                      onClick={handleDeleteAccount}
                      className="btn-danger"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}