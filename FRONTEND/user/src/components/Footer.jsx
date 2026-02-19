import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-bottom">
          © {new Date().getFullYear()} SM Quiz App. All rights reserved.
          <span className="footer-separator"> | </span>
          <span className="footer-credit">
            Designed & Developed by{" "}
            <a
              href="https://www.linkedin.com/in/subhasis-mukherjee-b43257240/"
              target="_blank"
              rel="noopener noreferrer"
            >
              SUBHASIS
            </a>{" "}
            &{" "}
            <a
              href="https://github.com/Killerturi"
              target="_blank"
              rel="noopener noreferrer"
            >
              AJOY
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
