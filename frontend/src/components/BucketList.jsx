import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BucketList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'adventure', priority: 'medium' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await api.bucketlist.list();
    setItems(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.bucketlist.create(formData);
    setShowModal(false);
    setFormData({ title: '', description: '', category: 'adventure', priority: 'medium' });
    loadItems();
  };

  const handleToggle = async (id) => {
    await api.bucketlist.toggle(id);
    loadItems();
  };

  const handleDelete = async (id) => {
    if (confirm('Remove this from the bucket list?')) {
      await api.bucketlist.delete(id);
      loadItems();
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : filter === 'completed' 
      ? items.filter(i => i.completed)
      : items.filter(i => !i.completed);

  const stats = {
    total: items.length,
    completed: items.filter(i => i.completed).length,
    pending: items.filter(i => !i.completed).length
  };

  const categoryIcons = {
    adventure: '🏔️',
    food: '🍔',
    travel: '✈️',
    skills: '🎯',
    funny: '😂',
    other: '📌'
  };

  const priorityColors = {
    high: '#e74c3c',
    medium: '#f39c12',
    low: '#27ae60'
  };

  return (
    <section id="bucketlist">
      <div className="section-header">
        <h2 className="section-title">Group Bucket List</h2>
        <p className="section-subtitle">Adventures we want to do together</p>
      </div>

      <div className="bucket-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Done ✅</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">To Go 🎯</span>
        </div>
      </div>

      <button className="add-joke-btn" onClick={() => setShowModal(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add to Bucket List
      </button>

      <div className="filter-tabs">
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bucket-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🎯</span>
            <p>{filter === 'completed' ? 'No completed adventures yet!' : 'The bucket list is empty!'}</p>
            <p className="empty-sub">Start adding things you want to do together</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div 
              key={item._id} 
              className={`bucket-item ${item.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <button className="bucket-checkbox" onClick={() => handleToggle(item._id)}>
                {item.completed ? '✓' : ''}
              </button>
              
              <div className="bucket-content">
                <div className="bucket-header">
                  <span className="bucket-category">{categoryIcons[item.category] || '📌'}</span>
                  <span className="bucket-title">{item.title}</span>
                  <span 
                    className="bucket-priority" 
                    style={{ background: priorityColors[item.priority] }}
                  >
                    {item.priority}
                  </span>
                </div>
                {item.description && <p className="bucket-description">{item.description}</p>}
                <div className="bucket-meta">
                  <span>Added by {item.addedBy?.displayName || 'Unknown'}</span>
                  {item.completed && item.completedBy && (
                    <span className="completed-by">✓ Done by {item.completedBy?.displayName}</span>
                  )}
                </div>
              </div>
              
              <button className="delete-btn-small" onClick={() => handleDelete(item._id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="modal-overlay active" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add to Bucket List</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>What do you want to do?</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Go skydiving together"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Any details..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="adventure">🏔️ Adventure</option>
                    <option value="food">🍔 Food</option>
                    <option value="travel">✈️ Travel</option>
                    <option value="skills">🎯 Skills</option>
                    <option value="funny">😂 Funny</option>
                    <option value="other">📌 Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to List</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
