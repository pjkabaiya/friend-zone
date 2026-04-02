import Gallery from '../components/Gallery';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Memories() {
  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>Memories</h1>
        <p>Our favorite moments together</p>
      </div>
      <Gallery />
      <Footer />
    </>
  );
}
