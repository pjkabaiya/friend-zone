import Chat from '../components/Chat';
import Navbar from '../components/Navbar';

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '70px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Chat />
      </div>
    </>
  );
}
