import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="about">
      <section className="about-hero">
        <div className="hero-noise" />
        <div className="about-hero-content">
          <p className="hero-eyebrow">THE MAN. THE MUSIC. THE MISSION.</p>
          <h1 className="hero-title">
            <span className="hero-line">ABOUT</span>
            <span className="hero-line accent">PLUGGY</span>
            <span className="hero-line">SAN</span>
          </h1>
        </div>
      </section>

      <section className="about-body">
        <div className="about-text">
          <div className="section-label">THE STORY</div>
          <h2 className="section-heading">
            GOA.
            <br />
            <span className="accent">FILM.</span>
            <br />
            THE
            <br />
            DANCEFLOOR.
          </h2>
          <div className="about-paragraphs">
            <p>
              Pluggy San is a Goa-based DJ, composer, and sound designer whose
              sets move fluidly between hip-hop, 90s pop classics, and
              bass-heavy electronic music.
            </p>
            <p>
              After two years behind the decks and over{" "}
              <strong>20 years composing for film and electronic music</strong>,
              he brings a deeply musical and cinematic approach to the
              dancefloor.
            </p>
            <p>
              The <strong>Plugs For Pluggy</strong> platform gives the crowd a
              voice — request a track, vote it up, and watch the playlist shape
              itself around the people in the room.
            </p>
          </div>
          <Link to="/" className="hero-cta">
            SEE EVENTS →
          </Link>
        </div>
        <div className="about-visual">
          <div className="about-stat">
            <span className="stat-num">20+</span>
            <span className="stat-label">EVENTS PLAYED</span>
          </div>
          <div className="about-stat">
            <span className="stat-num">20+</span>
            <span className="stat-label">YEARS IN MUSIC</span>
          </div>
          <div className="about-stat">
            <span className="stat-num">∞</span>
            <span className="stat-label">TRACKS IN THE CRATE</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">
          <img
            src="/Pluggy San Logo.png"
            alt="Pluggy San"
            className="footer-logo-img"
          />
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} PluggySan. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
