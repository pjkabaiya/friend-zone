import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Blog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await api.posts.list();
    setPosts(Array.isArray(data) ? data : []);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    await api.posts.create(content);
    setContent('');
    setShowCancel(false);
    loadPosts();
  };

  const handleReact = async (postId, emoji) => {
    const result = await api.posts.react(postId, emoji);
    if (result.reactions) {
      setPosts(prev => prev.map(post => 
        post._id === postId ? { ...post, reactions: result.reactions } : post
      ));
    } else {
      loadPosts();
    }
  };

  const confirmDelete = (postId) => {
    setDeletePostId(postId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deletePostId) {
      await api.posts.delete(deletePostId);
      setShowDeleteModal(false);
      setDeletePostId(null);
      loadPosts();
    }
  };

  const timeAgo = (date) => {
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

  const reactions = ['❤️', '😂', '🔥'];

  return (
    <section id="blog">
      <div className="section-header">
        <h2 className="section-title">The Wall</h2>
        <p className="section-subtitle">Share what's on your mind</p>
      </div>

      <div className="blog-container">
        <div className="blog-composer">
          <div className="composer-header">
            <img
              src={getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=E8B4B8`}
              alt="Your avatar"
              className="composer-avatar"
            />
            <textarea
              className="composer-input"
              placeholder="What's happening with the crew?"
              rows={showCancel ? 4 : 2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setShowCancel(true)}
            />
          </div>
          <div className="composer-actions">
            <button className="btn btn-secondary" style={{ display: showCancel ? 'inline-block' : 'none' }} onClick={() => { setContent(''); setShowCancel(false); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handlePost} disabled={!content.trim()}>
              Post
            </button>
          </div>
        </div>

        <div className="blog-posts">
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9A9A9A', padding: '40px' }}>
              No posts yet. Be the first to share something!
            </p>
          ) : (
            posts.map((post, index) => {
              const reactionsObj = post.reactions || {};
              return (
                <div key={post._id} className="blog-post visible" style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="post-header">
                    <img
                      src={getImageUrl(post.author?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.displayName || 'U')}&background=E8B4B8`}
                      alt={post.author?.displayName}
                      className="post-avatar"
                    />
                    <div className="post-meta">
                      <div className="post-author">{post.author?.displayName || 'Unknown'}</div>
                      <div className="post-time">{timeAgo(post.createdAt)}</div>
                    </div>
                    {user?._id === post.author?._id && (
                      <button className="delete-btn" onClick={() => confirmDelete(post._id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="post-content">{post.content}</div>
                  <div className="post-reactions">
                    {reactions.map(emoji => (
                      <button
                        key={emoji}
                        className="reaction-btn"
                        onClick={() => handleReact(post._id, emoji)}
                      >
                        {emoji} <span>{reactionsObj[emoji] || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button className="fab" onClick={() => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' })}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay active" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e8b4b8" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="modal-title" style={{ marginBottom: '12px' }}>Delete Post?</h3>
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
