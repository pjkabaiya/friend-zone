import BucketList from '../components/BucketList';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BucketListPage() {
  return (
    <>
      <Navbar />
      <div className="page-hero">
        <h1>Bucket List</h1>
        <p>Adventures we want to do together</p>
      </div>
      <BucketList />
      <Footer />
    </>
  );
}
