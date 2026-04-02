const quotes = [
  "Made with chaos and love 💀",
  "Powered by vibes alone ✨",
  "Where legends are made 👑",
  "No thoughts, just vibes 🧠",
  "Keeping it weird since day 1 🤪"
];

export default function Footer() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-quote">{randomQuote}</p>
        <div className="footer-divider"></div>
        <p className="footer-credit">
          <span className="footer-icon">🦊</span>
          FRIEND ZONE
          <span className="footer-icon">🦊</span>
        </p>
        <p className="footer-year">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
