import Events from '../components/Events';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>Events</h1>
        <p>Upcoming gatherings and celebrations</p>
      </div>
      <Events />
      <Footer />
    </>
  );
}
