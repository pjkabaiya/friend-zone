import { useState, useEffect, useRef } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Gallery() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState({ open: false, item: null });
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('other');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareCaption, setShareCaption] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const reactions = ['❤️', '😍', '🔥', '😂', '🎉', '👏'];

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const data = await api.gallery.list();
    setItems(Array.isArray(data) ? data : []);
  };

  const handleReact = async (itemId, emoji) => {
    await api.gallery.react(itemId, emoji);
    loadGallery();
  };

  const confirmDelete = (itemId) => {
    setDeleteItemId(itemId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deleteItemId) {
      await api.gallery.delete(deleteItemId);
      setShowDeleteModal(false);
      setDeleteItemId(null);
      loadGallery();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('caption', caption);
    formData.append('category', category);

    try {
      const result = await api.gallery.upload(formData);
      if (result.error) {
        alert(result.error);
      } else {
        await loadGallery();
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreview(null);
        setCaption('');
        setCategory('other');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  const openShareModal = (item) => {
    const imageUrl = getImageUrl(item.imageUrl);
    setShareUrl(imageUrl || '');
    setShareCaption(item.caption || '');
    setShowShareModal(true);
  };

  const shareToClipboard = async () => {
    const text = `${shareCaption ? shareCaption + '\n\n' : ''}${shareUrl}`;
    await navigator.clipboard.writeText(text);
    setShowShareModal(false);
    alert('Link copied!');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareCaption ? shareCaption + '\n\n' : ''}${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(shareCaption);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const openLightbox = (item) => {
    setLightbox({ open: true, item });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, item: null });
  };

  const getImageSrc = (item) => {
    if (!item.imageUrl) return null;
    return getImageUrl(item.imageUrl);
  };

  const filteredItems = filter === 'all' ? items : items.filter(item => item.category === filter);

  const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
    for (const { label, seconds: secs } of intervals) {
      const interval = Math.floor(seconds / secs);
      if (interval >= 1) return `${interval} ${label}${interval === 1 ? '' : 's'} ago`;
    }
    return 'Just now';
  };

  return (
    <section id="gallery">
      <div className="section-header">
        <h2 className="section-title">Memory Lane</h2>
        <p className="section-subtitle">Snapshots from our adventures together</p>
      </div>

      <button className="upload-btn-full" onClick={() => setShowUploadModal(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Share a Memory
      </button>

      <div className="gallery-filters">
        {['all', 'beach', 'cabin', 'city', 'meme', 'random'].map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="instagram-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <span className="empty-emoji">📸</span>
            <p>No memories yet!</p>
            <p className="empty-sub">Share your first adventure</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const uploader = item.uploadedBy;
            
            return (
              <div
                key={item._id}
                className="instagram-post"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Post Header */}
                <div className="post-header-bar">
                  <div className="post-user-info">
                    <img
                      src={getImageUrl(uploader?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader?.displayName || 'U')}&background=2A9D8F`}
                      alt={uploader?.displayName || 'User'}
                      className="post-avatar-small"
                    />
                    <div className="post-user-details">
                      <span className="post-username">{uploader?.displayName || 'Unknown'}</span>
                      <span className="post-time-small">{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                  {user?._id === item.uploadedBy?._id && (
                    <button className="delete-btn" onClick={() => confirmDelete(item._id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Post Image */}
                <div className="post-image-container" onClick={() => openLightbox(item)}>
                  {item.imageUrl ? (
                    <img src={getImageSrc(item)} alt={item.caption || 'Memory'} className="post-image" />
                  ) : (
                    <div className="post-image-placeholder">
                      <span>No image</span>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="post-actions">
                  <div className="post-actions-left">
                    <div className="reaction-picker">
                      {reactions.slice(0, 3).map(emoji => (
                        <button 
                          key={emoji} 
                          className="reaction-quick"
                          onClick={() => handleReact(item._id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button className="post-action-btn" onClick={() => openLightbox(item)}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </button>
                    <button className="post-action-btn" onClick={() => openShareModal(item)}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                  {item.reactions && Object.keys(item.reactions).length > 0 && (
                    <span className="reaction-count">
                      {Object.entries(item.reactions).filter(([_, count]) => count > 0).map(([emoji, count]) => `${emoji}${count}`).join(' ')}
                    </span>
                  )}
                </div>

                {/* Post Content */}
                <div className="post-content-bar">
                  {item.caption && (
                    <p className="post-caption">
                      <span className="post-caption-username">{uploader?.displayName || 'Unknown'}</span>
                      {' '}
                      <span className="post-caption-text">{item.caption}</span>
                    </p>
                  )}
                  {item.category && item.category !== 'other' && (
                    <span className="post-category-tag">#{item.category}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay active" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📷 Share a Memory</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Select Photo</label>
                <input type="file" accept="image/*" onChange={handleFileSelect} />
              </div>

              {preview && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                </div>
              )}

              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Describe this memory..."
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="beach">🏖️ Beach Trip</option>
                  <option value="cabin">🏕️ Cabin Weekend</option>
                  <option value="city">🌆 City Adventure</option>
                  <option value="meme">😂 Meme / Funny</option>
                  <option value="random">🎲 Random</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay active" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Share Memory</h3>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-form">
              {shareCaption && <p style={{ marginBottom: '12px', fontWeight: '600' }}>{shareCaption}</p>}
              
              <div className="share-options">
                <button className="share-btn" onClick={shareToClipboard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Link
                </button>
                <button className="share-btn whatsapp" onClick={shareViaWhatsApp}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button className="share-btn twitter" onClick={shareViaTwitter}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox.open && lightbox.item && (
        <div className="lightbox active">
          <div className="lightbox-content">
            <button className="lightbox-close" onClick={closeLightbox}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className="lightbox-post">
              {lightbox.item.imageUrl && (
                <img src={getImageSrc(lightbox.item)} alt="Memory" className="lightbox-image" />
              )}
              <div className="lightbox-info">
                <div className="lightbox-user">
                  <img
                    src={getImageUrl(lightbox.item.uploadedBy?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(lightbox.item.uploadedBy?.displayName || 'U')}&background=2A9D8F`}
                    alt={lightbox.item.uploadedBy?.displayName}
                    className="post-avatar-small"
                  />
                  <div>
                    <span className="post-username">{lightbox.item.uploadedBy?.displayName || 'Unknown'}</span>
                    <span className="post-time-small">{timeAgo(lightbox.item.createdAt)}</span>
                  </div>
                </div>
                {lightbox.item.caption && (
                  <p className="lightbox-caption">
                    <span className="post-caption-username">{lightbox.item.uploadedBy?.displayName || 'Unknown'}</span>
                    {' '}{lightbox.item.caption}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={() => { closeLightbox(); openShareModal(lightbox.item); }}>
                    Share
                  </button>
                  {user?._id === lightbox.item.uploadedBy?._id && (
                    <button className="btn btn-secondary" style={{ background: '#c00', color: 'white' }} onClick={() => { closeLightbox(); confirmDelete(lightbox.item._id); }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay active" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="modal-title" style={{ marginBottom: '12px' }}>Delete Memory?</h3>
            <p style={{ color: '#9A9A9A', marginBottom: '24px' }}>This action cannot be undone.</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#c00' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
