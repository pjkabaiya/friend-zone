import MoodTracker from '../components/MoodTracker';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Mood() {
  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>Mood Check-in</h1>
        <p>How's everyone feeling today?</p>
      </div>
      <MoodTracker />
      <Footer />
    </>
  );
}
