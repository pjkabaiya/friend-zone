import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const greetings = [
  "Welcome Back, Legends! 🎉",
  "The Party's Right Here! 🎊",
  "Let's Make Memories! ✨",
  "Ready For Fun? 🔥",
  "The Squad Assembled! 💪",
  "Great To See Ya! 👋",
  "It's Giving... Amazing! 💅",
  "Slay! Come In! ✨"
];

export default function Hero() {
  const [greeting, setGreeting] = useState(greetings[0]);
  const [showSpeech, setShowSpeech] = useState(true);

  const getRandomGreeting = () => {
    const random = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(random);
    setShowSpeech(false);
    setTimeout(() => setShowSpeech(true), 100);
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="mascot-container">
          <div className="mascot" onClick={getRandomGreeting}>
            <span className="mascot-face">😎</span>
            {showSpeech && <div className="mascot-speech">{greeting}</div>}
          </div>
        </div>
        
        <h1>FRIEND <span>ZONE</span></h1>
        <p className="hero-tagline">Where Legends Hang Out</p>
        <p className="hero-subtitle">
          The only place where your chaos is welcome, 
          your squad is forever, and your vibes are always right!
        </p>
        <div className="hero-buttons">
          <Link to="/crew" className="hero-cta">
            Meet The Squad
          </Link>
          <Link to="/chat" className="hero-cta secondary">
            Start Chatting
          </Link>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/mood" className="quick-link">
          <span className="quick-icon">😊</span>
          <span>Check Vibes</span>
        </Link>
        <Link to="/chat" className="quick-link">
          <span className="quick-icon">💬</span>
          <span>Group Chat</span>
        </Link>
        <Link to="/entertainment" className="quick-link">
          <span className="quick-icon">⚽</span>
          <span>E-Football</span>
        </Link>
        <Link to="/bucket-list" className="quick-link">
          <span className="quick-icon">🎯</span>
          <span>Dreams</span>
        </Link>
      </div>
    </section>
  );
}
