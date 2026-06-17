import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";

export default function Navbar() {
  const { events: EVENTS } = useEvents();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img
          src="/Pluggy San Logo.png"
          alt="Pluggy San"
          className="navbar-logo-img"
        />
      </Link>

      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="menu"
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            HOME
          </Link>
        </li>
        <li className="has-dropdown" ref={dropdownRef}>
          <button
            className="nav-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            EVENTS{" "}
            <span className={`nav-chevron ${dropdownOpen ? "up" : ""}`}>▾</span>
          </button>
          {dropdownOpen && (
            <ul className="dropdown">
              {EVENTS.map((ev) => (
                <li key={ev.id}>
                  <Link
                    to={`/event/${ev.id}`}
                    onClick={() => {
                      setDropdownOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="dd-title">{ev.title}</span>
                    <span className="dd-date">
                      {new Date(ev.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            ABOUT
          </Link>
        </li>
      </ul>
    </nav>
  );
}
