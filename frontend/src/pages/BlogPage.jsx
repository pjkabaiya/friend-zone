import Blog from '../components/Blog';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>Blog</h1>
        <p>Thoughts, updates, and conversations</p>
      </div>
      <Blog />
      <Footer />
    </>
  );
}
