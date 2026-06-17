import { Link } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";

export default function Home() {
  const { events, loading } = useEvents();
  const upcoming = events;

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-noise" />
        <div className="hero-content">
          <p className="hero-eyebrow">DJ · SELECTOR · CURATOR</p>
          <h1 className="hero-title">
            <span className="hero-line">PLUGS</span>
            <span className="hero-line accent">FOR</span>
            <span className="hero-line">PLUGGY</span>
          </h1>
          <p className="hero-sub">
            Request tracks. Cast votes. Shape the night.
          </p>
          {upcoming.length > 0 && (
            <Link to={`/event/${upcoming[0].id}`} className="hero-cta">
              REQUEST NOW ↗
            </Link>
          )}
        </div>
        <div className="hero-scroll-hint">SCROLL</div>
      </section>

      {/* EVENTS GRID */}
      <section className="events-section">
        <div className="section-label">UPCOMING EVENTS</div>
        <h2 className="section-heading">
          WHERE IS
          <br />
          <span className="accent">PLUGGYSAN</span>
          <br />
          PLAYING?
        </h2>
        <div className="events-grid">
          {loading && <p className="admin-muted">Loading events…</p>}
          {!loading && upcoming.length === 0 && (
            <p className="admin-muted">No upcoming events.</p>
          )}
          {upcoming.map((ev, i) => (
            <Link
              to={`/event/${ev.id}`}
              key={ev.id}
              className={`event-card ${i === 0 ? "featured" : ""}`}
            >
              <div
                className="event-card-img"
                style={{ backgroundImage: `url(${ev.image})` }}
              >
                <div className="event-card-overlay" />
                <span className="event-genre">{ev.genre}</span>
              </div>
              <div className="event-card-body">
                <div className="event-card-date">
                  {new Date(ev.date)
                    .toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </div>
                <h3 className="event-card-title">{ev.title}</h3>
                <p className="event-card-venue">
                  {ev.venue} — {ev.location}
                </p>
                <span className="event-card-cta">REQUEST TRACKS →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="how-inner">
          <div className="section-label light">HOW IT WORKS</div>
          <h2 className="section-heading light">
            THREE
            <br />
            <span className="accent-yellow">STEPS</span>
            <br />
            TO THE
            <br />
            DROP
          </h2>
          <div className="steps">
            <div className="step">
              <span className="step-num">01</span>
              <h3>FIND THE EVENT</h3>
              <p>
                Pick the night you're attending from the events list.
              </p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>REQUEST A TRACK</h3>
              <p>
                Search any song. Add it to the queue.
              </p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>VOTE IT UP</h3>
              <p>
               Rally your crew! More votes, better the chances Pluggy San plays it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
