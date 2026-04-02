import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    insideJoke: user?.insideJoke || ''
  });

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const result = await api.users.uploadAvatar(file);
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('friendzone_user', JSON.stringify(result.user));
        setMessage({ type: 'success', text: 'Avatar updated!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const result = await api.users.updateProfile(formData);
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('friendzone_user', JSON.stringify(result.user));
        setMessage({ type: 'success', text: 'Profile updated!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
  };

  const avatarUrl = getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=2A9D8F&size=200&bold=true`;

  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>My Profile</h1>
        <p>Customize your presence in Friend Zone</p>
      </div>

      <main className="page-content">
        <div className="profile-container">
          <div className="avatar-section">
            <div className="avatar-wrapper" onClick={handleAvatarClick}>
              <img src={avatarUrl} alt={user?.displayName || 'Avatar'} className="profile-avatar" />
              <div className="avatar-overlay">
                {uploading ? (
                  <span className="upload-spinner">Uploading...</span>
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Change Photo</span>
                  </>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <p className="avatar-hint">Click to upload a new photo</p>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your display name"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Inside Joke Tag</label>
              <input
                type="text"
                value={formData.insideJoke}
                onChange={(e) => setFormData({ ...formData, insideJoke: e.target.value })}
                placeholder="A fun nickname or catchphrase"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>

          <div className="profile-info">
            <h3>Account Info</h3>
            <div className="info-row">
              <span className="info-label">Username</span>
              <span className="info-value">@{user?.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
