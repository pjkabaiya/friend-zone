import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const data = await api.users.list();
    setMembers(Array.isArray(data) ? data : []);
  };

  return (
    <section id="members">
      <div className="section-header">
        <h2 className="section-title">The Crew</h2>
        <p className="section-subtitle">The amazing humans behind this whole thing</p>
      </div>

      <div className="members-grid">
        {members.map((member, index) => (
          <div key={member._id} className="member-card visible" style={{ transitionDelay: `${index * 100}ms` }}>
            <div className="member-card-inner">
              <div className="member-image-wrap">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&background=E8B4B8&size=200&bold=true`}
                  alt={member.displayName}
                  className="member-avatar"
                />
                {member.insideJoke && <span className="member-tag">{member.insideJoke}</span>}
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.displayName}</h3>
                {member.bio && (
                  <p className="member-quote">"{member.bio}"</p>
                )}
                <span className="member-username">@{member.username}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
