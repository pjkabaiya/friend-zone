import Members from '../components/Members';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>The Crew</h1>
        <p>The amazing people behind Friend Zone</p>
      </div>
      <div className="page-content">
        <Members />
      </div>
      <Footer />
    </>
  );
}
