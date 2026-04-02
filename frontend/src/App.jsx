import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Home from './pages/Home';
import Mood from './pages/Mood';
import ChatPage from './pages/ChatPage';
import Memories from './pages/Memories';
import BucketListPage from './pages/BucketListPage';
import EventsPage from './pages/EventsPage';
import BlogPage from './pages/BlogPage';
import Profile from './pages/Profile';
import Entertainment from './pages/Entertainment';
import Admin from './pages/Admin';

function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <DashboardLayout>
            <Hero />
          </DashboardLayout>
        } />
        <Route path="/crew" element={<Home />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/bucket-list" element={<BucketListPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/entertainment" element={<Entertainment />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
