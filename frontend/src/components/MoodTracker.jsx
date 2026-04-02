import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MOODS = [
  { emoji: '😄', label: 'Amazing', color: '#27ae60' },
  { emoji: '😊', label: 'Good', color: '#2ecc71' },
  { emoji: '😐', label: 'Okay', color: '#f39c12' },
  { emoji: '😔', label: 'Down', color: '#e67e22' },
  { emoji: '😤', label: 'Frustrated', color: '#e74c3c' },
  { emoji: '🤩', label: 'Excited', color: '#9b59b6' },
  { emoji: '😴', label: 'Tired', color: '#3498db' },
  { emoji: '🥳', label: 'Celebrating', color: '#e91e63' }
];

export default function MoodTracker() {
  const { user } = useAuth();
  const [todayMood, setTodayMood] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    const [today, recent] = await Promise.all([
      api.mood.today(),
      api.mood.list(7)
    ]);
    setTodayMood(Array.isArray(today) ? today[0] : today);
    setRecentMoods(Array.isArray(recent) ? recent : []);
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    const mood = MOODS.find(m => m.emoji === selectedMood);
    await api.mood.create({
      mood: selectedMood,
      moodLabel: mood?.label || '',
      note
    });
    setShowModal(false);
    setSelectedMood(null);
    setNote('');
    loadMoods();
  };

  const getMoodInfo = (emoji) => MOODS.find(m => m.emoji === emoji) || MOODS[1];

  const groupedMoods = recentMoods.reduce((acc, mood) => {
    const date = new Date(mood.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(mood);
    return acc;
  }, {});

  return (
    <section id="mood">
      <div className="section-header">
        <h2 className="section-title">Mood Check-in</h2>
        <p className="section-subtitle">How's everyone feeling today?</p>
      </div>

      {/* Today's Mood */}
      <div className="today-mood-card">
        {todayMood ? (
          <div className="mood-display">
            <span className="mood-big" style={{ color: getMoodInfo(todayMood.mood).color }}>
              {todayMood.mood}
            </span>
            <div className="mood-info">
              <span className="mood-label">{todayMood.moodLabel}</span>
              {todayMood.note && <p className="mood-note">"{todayMood.note}"</p>}
            </div>
            <span className="mood-time">Updated {new Date(todayMood.updatedAt || todayMood.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : (
          <div className="no-mood">
            <span className="mood-big">❓</span>
            <p>You haven't logged your mood today</p>
          </div>
        )}
        <button className="update-mood-btn" onClick={() => setShowModal(true)}>
          {todayMood ? 'Update Mood' : 'Log Your Mood'}
        </button>
      </div>

      {/* Crew Moods */}
      <div className="crew-moods">
        <h3 className="subsection-title">Crew Moods This Week</h3>
        
        {Object.keys(groupedMoods).length === 0 ? (
          <div className="empty-state-small">
            <p>No mood check-ins yet</p>
          </div>
        ) : (
          Object.entries(groupedMoods).map(([date, moods]) => (
            <div key={date} className="mood-day">
              <span className="mood-date">{date}</span>
              <div className="mood-avatars">
                {moods.map((mood, i) => (
                  <div key={mood._id || i} className="mood-avatar-wrap" title={`${mood.user?.displayName}: ${mood.moodLabel}`}>
                    <img
                      src={getImageUrl(mood.user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(mood.user?.displayName || 'U')}&background=E8B4B8`}
                      alt={mood.user?.displayName}
                      className="mood-avatar"
                    />
                    <span className="mood-emoji-small">{mood.mood}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mood Summary */}
      <div className="mood-summary">
        <h3 className="subsection-title">Mood Breakdown</h3>
        <div className="mood-stats">
          {MOODS.map(mood => {
            const count = recentMoods.filter(m => m.mood === mood.emoji).length;
            const percentage = recentMoods.length > 0 ? (count / recentMoods.length) * 100 : 0;
            return (
              <div key={mood.emoji} className="mood-stat">
                <span className="mood-stat-emoji">{mood.emoji}</span>
                <div className="mood-bar-wrap">
                  <div 
                    className="mood-bar" 
                    style={{ width: `${percentage}%`, background: mood.color }}
                  />
                </div>
                <span className="mood-stat-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood Modal */}
      {showModal && (
        <div className="modal-overlay active" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">How are you feeling?</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="mood-grid">
              {MOODS.map(mood => (
                <button
                  key={mood.emoji}
                  className={`mood-option ${selectedMood === mood.emoji ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.emoji)}
                  style={{ '--mood-color': mood.color }}
                >
                  <span className="mood-option-emoji">{mood.emoji}</span>
                  <span className="mood-option-label">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Add a note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!selectedMood}>
                Save Mood
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
