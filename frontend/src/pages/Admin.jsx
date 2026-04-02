import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddResult, setShowAddResult] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resultForm, setResultForm] = useState({ homeTeamId: '', awayTeamId: '', homeScore: 0, awayScore: 0 });
  const [userForm, setUserForm] = useState({
    username: '', email: '', displayName: '', password: '', insideJoke: '', role: 'member'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [teamsData, matchesData, usersData, postsData, galleryData] = await Promise.all([
      api.league.getTeams(),
      api.league.getMatches(),
      api.users.list(),
      api.posts.list(),
      api.gallery.list()
    ]);
    setTeams(Array.isArray(teamsData) ? teamsData : []);
    setMatches(Array.isArray(matchesData) ? matchesData : []);
    setUsers(Array.isArray(usersData) ? usersData : []);
    setPosts(Array.isArray(postsData) ? postsData : []);
    setGallery(Array.isArray(galleryData) ? galleryData : []);
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.trim()) return;
    await api.league.addTeam(newTeam.trim());
    setNewTeam('');
    setShowAddTeam(false);
    loadData();
  };

  const handleDeleteTeam = async (id) => {
    if (confirm('Delete this team? All matches with this team will also be deleted.')) {
      await api.league.deleteTeam(id);
      loadData();
    }
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    if (!resultForm.homeTeamId || !resultForm.awayTeamId) return;
    
    await api.league.addMatch({
      homeTeamId: resultForm.homeTeamId,
      awayTeamId: resultForm.awayTeamId,
      homeScore: resultForm.homeScore,
      awayScore: resultForm.awayScore,
      matchDay: 1
    });
    
    setResultForm({ homeTeamId: '', awayTeamId: '', homeScore: 0, awayScore: 0 });
    setShowAddResult(false);
    loadData();
  };

  const handleDeleteMatch = async (id) => {
    if (confirm('Delete this match?')) {
      await api.league.deleteMatch(id);
      loadData();
    }
  };

  const handleResetLeague = async () => {
    if (confirm('Reset entire league? This will delete all teams and matches.')) {
      await api.league.resetLeague();
      loadData();
    }
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', email: '', displayName: '', password: '', insideJoke: '', role: 'member' });
    setShowUserModal(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      username: u.username,
      email: u.email,
      displayName: u.displayName,
      password: '',
      insideJoke: u.insideJoke || '',
      role: u.role || 'member'
    });
    setShowUserModal(true);
  };

  const openResetPassword = (u) => {
    setResetPasswordUser(u);
    setNewPassword('');
    setShowResetPassword(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }
    const result = await api.users.update(resetPasswordUser._id, { password: newPassword });
    if (!result.error) {
      setShowResetPassword(false);
      setResetPasswordUser(null);
      setNewPassword('');
      alert('Password updated successfully');
    } else {
      alert(result.error || 'Failed to reset password');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const result = editingUser
      ? await api.users.update(editingUser._id, userForm)
      : await api.users.create(userForm);
    
    if (!result.error) {
      setShowUserModal(false);
      setEditingUser(null);
      loadData();
    } else {
      alert(result.error || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Delete this user?')) {
      await api.users.delete(id);
      loadData();
    }
  };

  const handleDeletePost = async (id) => {
    if (confirm('Delete this post?')) {
      await api.posts.delete(id);
      loadData();
    }
  };

  const handleDeleteGallery = async (id) => {
    if (confirm('Delete this memory?')) {
      await api.gallery.delete(id);
      loadData();
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>Admin Panel</h1>
        <p>Manage everything from here</p>
      </div>

      <main className="page-content">
        <div className="admin-grid">
          <section className="admin-section">
            <div className="admin-section-header">
              <h2>E-Football League</h2>
              <div className="admin-actions">
                <button className="action-btn secondary" onClick={() => setShowAddTeam(true)}>+ Add Team</button>
                <button className="action-btn" onClick={() => setShowAddResult(true)}>+ Add Result</button>
              </div>
            </div>

            {teams.length === 0 ? (
              <p className="empty-text">No teams yet. Add teams to start the league.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>P</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>GD</th>
                      <th>PTS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr key={team._id}>
                        <td>{index + 1}</td>
                        <td>{team.name}</td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.drawn}</td>
                        <td>{team.lost}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td>{team.goalsFor - team.goalsAgainst}</td>
                        <td className="points">{team.points}</td>
                        <td><button className="delete-btn-small" onClick={() => handleDeleteTeam(team._id)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {matches.length > 0 && (
              <div className="admin-matches">
                <h3>Match History</h3>
                <div className="admin-match-list">
                  {matches.map(match => (
                    <div key={match._id} className="admin-match-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600' }}>{match.homeTeam?.name || 'TBD'}</span>
                        <span className="match-score" style={{ background: '#7C3AED', color: 'white', padding: '4px 12px', borderRadius: '8px' }}>
                          {match.homeScore} - {match.awayScore}
                        </span>
                        <span style={{ fontWeight: '600' }}>{match.awayTeam?.name || 'TBD'}</span>
                      </div>
                      <button className="delete-btn-small" onClick={() => handleDeleteMatch(match._id)}>×</button>
                    </div>
                  ))}
                </div>
                <button className="reset-btn" onClick={handleResetLeague}>Reset League</button>
              </div>
            )}
          </section>

          <section className="admin-section">
            <div className="admin-section-header">
              <h2>Users ({users.length})</h2>
              <div className="admin-actions">
                <button className="action-btn secondary" onClick={openAddUser}>+ Add User</button>
              </div>
            </div>
            {users.length === 0 ? (
              <p className="empty-text">No users</p>
            ) : (
              <div className="admin-list">
                {users.map(u => (
                  <div key={u._id} className="admin-list-item">
                    <div className="admin-list-content">
                      <img src={getImageUrl(u.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=FF3366&color=fff`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px', verticalAlign: 'middle' }} />
                      <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                        <strong>{u.displayName}</strong>
                        <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#6B7280' }}>@{u.username} · {u.role || 'member'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="match-btn" onClick={() => openResetPassword(u)} style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Reset Pass</button>
                      <button className="match-btn" onClick={() => openEditUser(u)} style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Edit</button>
                      {u._id !== user._id && (
                        <button className="delete-btn-small" onClick={() => handleDeleteUser(u._id)}>×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2>Posts ({posts.length})</h2>
            {posts.length === 0 ? (
              <p className="empty-text">No posts</p>
            ) : (
              <div className="admin-list">
                {posts.map(post => (
                  <div key={post._id} className="admin-list-item">
                    <div className="admin-list-content">
                      <strong>{post.author?.displayName}</strong>
                      <p>{post.content.substring(0, 50)}{post.content.length > 50 ? '...' : ''}</p>
                    </div>
                    <button className="delete-btn-small" onClick={() => handleDeletePost(post._id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2>Gallery ({gallery.length})</h2>
            {gallery.length === 0 ? (
              <p className="empty-text">No memories</p>
            ) : (
              <div className="admin-list">
                {gallery.map(item => (
                  <div key={item._id} className="admin-list-item">
                    <div className="admin-list-content">
                      <strong>{item.uploadedBy?.displayName}</strong>
                      <p>{item.caption?.substring(0, 50)}{item.caption?.length > 50 ? '...' : ''}</p>
                    </div>
                    <button className="delete-btn-small" onClick={() => handleDeleteGallery(item._id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {showAddTeam && (
        <div className="modal-overlay active" onClick={() => setShowAddTeam(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Team</h3>
              <button className="modal-close" onClick={() => setShowAddTeam(false)}>×</button>
            </div>
            <form onSubmit={handleAddTeam}>
              <div className="form-group">
                <label>Team Name</label>
                <input type="text" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} placeholder="Enter team name" required autoFocus />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTeam(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddResult && (
        <div className="modal-overlay active" onClick={() => setShowAddResult(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Result</h3>
              <button className="modal-close" onClick={() => setShowAddResult(false)}>×</button>
            </div>
            <form onSubmit={handleAddResult}>
              <div className="form-group">
                <label>Home Team</label>
                <select 
                  value={resultForm.homeTeamId} 
                  onChange={(e) => setResultForm({...resultForm, homeTeamId: e.target.value})} 
                  required
                >
                  <option value="">Select home team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                <input 
                  type="number" 
                  min="0" 
                  value={resultForm.homeScore} 
                  onChange={(e) => setResultForm({...resultForm, homeScore: parseInt(e.target.value) || 0})}
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.5rem', padding: '12px', borderRadius: '12px', border: '2px solid var(--border)' }}
                  placeholder="0"
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>-</span>
                <input 
                  type="number" 
                  min="0" 
                  value={resultForm.awayScore} 
                  onChange={(e) => setResultForm({...resultForm, awayScore: parseInt(e.target.value) || 0})}
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.5rem', padding: '12px', borderRadius: '12px', border: '2px solid var(--border)' }}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Away Team</label>
                <select 
                  value={resultForm.awayTeamId} 
                  onChange={(e) => setResultForm({...resultForm, awayTeamId: e.target.value})} 
                  required
                >
                  <option value="">Select away team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddResult(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!resultForm.homeTeamId || !resultForm.awayTeamId || resultForm.homeTeamId === resultForm.awayTeamId}>Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay active" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} required={!editingUser} disabled={!!editingUser} />
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" value={userForm.displayName} onChange={(e) => setUserForm({...userForm, displayName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Inside Joke Tag</label>
                <input type="text" value={userForm.insideJoke} onChange={(e) => setUserForm({...userForm, insideJoke: e.target.value})} placeholder="e.g., 'The coffee expert'" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPassword && resetPasswordUser && (
        <div className="modal-overlay active" onClick={() => setShowResetPassword(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close" onClick={() => setShowResetPassword(false)}>×</button>
            </div>
            <form onSubmit={handleResetPassword}>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Setting new password for: <strong>{resetPasswordUser.displayName}</strong>
              </p>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password"
                  required
                  minLength={4}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetPassword(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
