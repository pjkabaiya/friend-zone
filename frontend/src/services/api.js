const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8787';
const UPLOADS_URL = `${API_ORIGIN}/uploads`;

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) {
    return `${API_ORIGIN}${path}`;
  }
  if (path.startsWith('/avatars')) {
    return `${API_ORIGIN}/uploads${path}`;
  }
  return `${UPLOADS_URL}${path}`;
};

const getHeaders = () => {
  const token = localStorage.getItem('friendzone_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const requestJson = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem('friendzone_token');
      window.dispatchEvent(new Event('friendzone-auth-expired'));
    }

    if (!response.ok && !data?.error) {
      return { error: `Request failed (${response.status})` };
    }

    return data;
  } catch (error) {
    return { error: 'Network error: unable to reach server. Please try again.' };
  }
};

export const api = {
  auth: {
    login: (username, password) =>
      requestJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }),

    register: (data) =>
      requestJson(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),

    me: () =>
      requestJson(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      })
  },

  users: {
    list: async () => unwrapList(await requestJson(`${API_BASE}/users`, { headers: getHeaders() })),

    create: (data) =>
      requestJson(`${API_BASE}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),

    updateProfile: (data) =>
      requestJson(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),

    update: (id, data) =>
      requestJson(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),

    delete: (id) =>
      requestJson(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }),

    uploadAvatar: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return requestJson(`${API_BASE}/users/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('friendzone_token')}` },
        body: formData
      });
    }
  },

  gallery: {
    list: async (category) => unwrapList(await requestJson(`${API_BASE}/gallery${category ? `?category=${category}` : ''}`, {
        headers: getHeaders()
      })),

    upload: (formData) =>
      requestJson(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('friendzone_token')}` },
        body: formData
      }),

    delete: (id) =>
      requestJson(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }),

    react: (id, emoji) =>
      requestJson(`${API_BASE}/gallery/${id}/react`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ emoji })
      })
  },

  events: {
    list: async () => unwrapList(await requestJson(`${API_BASE}/events`, { headers: getHeaders() })),

    create: (data) =>
      requestJson(`${API_BASE}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),

    delete: (id) =>
      requestJson(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
  },

  posts: {
    list: async () => unwrapList(await requestJson(`${API_BASE}/posts`, { headers: getHeaders() })),

    create: (content) =>
      requestJson(`${API_BASE}/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content })
      }),

    react: (id, emoji) =>
      requestJson(`${API_BASE}/posts/${id}/react`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ emoji })
      }),

    delete: (id) =>
      requestJson(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
  },

  jokes: {
    list: async () => unwrapList(await requestJson(`${API_BASE}/jokes`, { headers: getHeaders() })),
    create: (data) =>
      requestJson(`${API_BASE}/jokes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),
    react: (id, emoji) =>
      requestJson(`${API_BASE}/jokes/${id}/react`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ emoji })
      }),
    delete: (id) =>
      requestJson(`${API_BASE}/jokes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
  },

  bucketlist: {
    list: async (completed) => unwrapList(await requestJson(`${API_BASE}/bucketlist${completed !== undefined ? `?completed=${completed}` : ''}`, { 
        headers: getHeaders() 
      })),
    create: (data) =>
      requestJson(`${API_BASE}/bucketlist`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),
    toggle: (id) =>
      requestJson(`${API_BASE}/bucketlist/${id}/toggle`, {
        method: 'PUT',
        headers: getHeaders()
      }),
    delete: (id) =>
      requestJson(`${API_BASE}/bucketlist/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
  },

  mood: {
    list: async (days = 7) => unwrapList(await requestJson(`${API_BASE}/mood?days=${days}`, { headers: getHeaders() })),
    today: () =>
      requestJson(`${API_BASE}/mood/today`, { headers: getHeaders() }),
    create: (data) =>
      requestJson(`${API_BASE}/mood`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
  },

  league: {
    getTeams: async () => unwrapList(await requestJson(`${API_BASE}/league/teams`, { headers: getHeaders() })),
    addTeam: (name) =>
      requestJson(`${API_BASE}/league/teams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name })
      }),
    deleteTeam: (id) =>
      requestJson(`${API_BASE}/league/teams/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }),
    getMatches: async () => unwrapList(await requestJson(`${API_BASE}/league/matches`, { headers: getHeaders() })),
    addMatch: (data) =>
      requestJson(`${API_BASE}/league/matches`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),
    updateResult: (id, homeScore, awayScore) =>
      requestJson(`${API_BASE}/league/matches/${id}/result`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ homeScore, awayScore })
      }),
    deleteMatch: (id) =>
      requestJson(`${API_BASE}/league/matches/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }),
    resetLeague: () =>
      requestJson(`${API_BASE}/league/reset`, {
        method: 'DELETE',
        headers: getHeaders()
      })
  }
};
