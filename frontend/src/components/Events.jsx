import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    title: '', date: '', type: 'reunion', location: '', description: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await api.events.list();
    setEvents(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await api.events.create(formData);
    if (!result.error) {
      setShowModal(false);
      setFormData({ title: '', date: '', type: 'reunion', location: '', description: '' });
      loadEvents();
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await api.events.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      loadEvents();
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = new Date();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const upcoming = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  return (
    <section id="events">
      <div className="section-header">
        <h2 className="section-title">What's Happening</h2>
        <p className="section-subtitle">Birthdays, reunions, and everything in between</p>
      </div>

      <div className="events-container">
        <div className="calendar">
          <div className="calendar-header">
            <h3 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h3>
            <div className="calendar-nav">
              <button onClick={prevMonth}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button onClick={nextMonth}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="calendar-weekday">{d}</span>
            ))}
          </div>

          <div className="calendar-days">
            {[...Array(firstDay)].map((_, i) => (
              <div key={`prev-${i}`} className="calendar-day other-month">
                {daysInPrevMonth - firstDay + i + 1}
              </div>
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const dayEvents = events.filter(e => {
                const d = new Date(e.date);
                return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
              });
              return (
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                  {day}
                  {dayEvents.map(e => (
                    <span key={e._id} className={`event-dot ${e.type === 'birthday' ? 'birthday-dot' : 'event'}`}></span>
                  ))}
                </div>
              );
            })}
            {[...Array(42 - firstDay - daysInMonth)].map((_, i) => (
              <div key={`next-${i}`} className="calendar-day other-month">{i + 1}</div>
            ))}
          </div>
        </div>

        <div className="upcoming-events">
          <h3 className="upcoming-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Coming Up
          </h3>

          {upcoming.map(event => {
            const date = new Date(event.date);
            return (
              <div key={event._id} className="event-card">
                <div className="event-date-badge">
                  <div className="month">{monthNames[date.getMonth()].slice(0, 3)}</div>
                  <div className="day">{date.getDate()}</div>
                </div>
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {event.location || 'TBD'}
                  </p>
                  <span className={`event-type ${event.type}`}>
                    {event.type === 'birthday' ? '🎂' : '🥂'}
                    {event.type === 'birthday' ? 'Birthday' : 'Reunion'}
                  </span>
                </div>
                <button className="delete-btn" onClick={() => confirmDelete(event._id)} style={{ marginLeft: 'auto' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            );
          })}

          <button className="add-event-btn" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Event</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="reunion">Reunion</option>
                  <option value="birthday">Birthday</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g., Central Park" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional details" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <h3 className="modal-title" style={{ marginBottom: '12px' }}>Delete Event?</h3>
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
