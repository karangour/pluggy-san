import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ref, push, onValue, runTransaction, remove } from "firebase/database";
import { db } from "../firebase";
import { useEvents } from "../hooks/useEvents";

function getVoterId() {
  let id = localStorage.getItem("pluggy_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("pluggy_voter_id", id);
  }
  return id;
}

async function searchTracks(query) {
  const res = await fetch(
    `/.netlify/functions/search?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error("Search failed");
  const json = await res.json();
  return (json.results || []).map((t) => ({
    id: String(t.trackId),
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName,
    cover: t.artworkUrl100,
    coverSmall: t.artworkUrl60,
    preview: t.previewUrl || null,
  }));
}

export default function EventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const event = events.find((e) => e.id === eventId);
  const voterId = getVoterId();

  const [requests, setRequests] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [preview, setPreview] = useState(null);
  const [blinkId, setBlinkId] = useState(null);
  const audioRef = useRef(null);
  const debounceRef = useRef(null);

  const requestsRef = ref(db, `events/${eventId}/requests`);

  const sorted = [...requests].sort((a, b) => b.votes - a.votes);

  // On mount: if event date was 48h+ ago, wipe entire event from Firebase and go home
  useEffect(() => {
    if (!event) return;
    const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
    const eventTime = new Date(event.date).getTime();
    if (Date.now() - eventTime > FORTY_EIGHT_HOURS) {
      remove(ref(db, `events/${eventId}`)).then(() => navigate("/"));
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Subscribe to Firebase queue in real-time
  useEffect(() => {
    const unsub = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRequests([]);
      } else {
        setRequests(
          Object.entries(data).map(([fbKey, val]) => ({ fbKey, ...val })),
        );
      }
      setLoadingQueue(false);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setSearchError("");
        setSearching(false);
        return;
      }
      setSearching(true);
      setSearchError("");
      try {
        const data = await searchTracks(query);
        setResults(data);
        if (data.length === 0)
          setSearchError("No tracks found. Try a different search.");
      } catch {
        setSearchError("Search failed. Please try again.");
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSearch(e) {
    e.preventDefault();
  }

  function selectResult(track) {
    setSelectedTrack(track);
    setQuery(`${track.title} — ${track.artist}`);
    setResults([]);
    setSearchError("");
  }

  function clearSelection() {
    setSelectedTrack(null);
    setQuery("");
    setResults([]);
    setSearchError("");
  }

  function hasVoted(track) {
    return !!(track.voters && track.voters[voterId]);
  }

  async function addToQueue() {
    if (!selectedTrack) return;
    const track = selectedTrack;
    const already = requests.find((r) => r.trackId === String(track.id));
    if (already) {
      if (!hasVoted(already)) {
        const trackRef = ref(db, `events/${eventId}/requests/${already.fbKey}`);
        await runTransaction(trackRef, (current) => {
          if (!current) return current;
          return {
            ...current,
            votes: (current.votes || 0) + 1,
            voters: { ...(current.voters || {}), [voterId]: true },
          };
        });
      }
      setBlinkId(already.fbKey);
      setTimeout(() => setBlinkId(null), 1400);
      clearSelection();
      return;
    }
    await push(requestsRef, {
      trackId: String(track.id),
      title: track.title,
      artist: track.artist,
      album: track.album || "",
      cover: track.cover || "",
      preview: track.preview || null,
      votes: 0,
      voters: {},
      addedAt: new Date().toISOString(),
    });
    clearSelection();
  }

  async function vote(track) {
    if (hasVoted(track)) return;
    const trackRef = ref(db, `events/${eventId}/requests/${track.fbKey}`);
    await runTransaction(trackRef, (current) => {
      if (!current) return current;
      return {
        ...current,
        votes: (current.votes || 0) + 1,
        voters: { ...(current.voters || {}), [voterId]: true },
      };
    });
  }

  function togglePreview(track) {
    if (!track.preview) return;
    const pid = track.fbKey || track.id;
    if (preview === pid) {
      audioRef.current?.pause();
      setPreview(null);
    } else {
      setPreview(pid);
      if (audioRef.current) {
        audioRef.current.src = track.preview;
        audioRef.current.play().catch(() => {});
      }
    }
  }

  if (!event) {
    return (
      <main className="not-found">
        <h1>EVENT NOT FOUND</h1>
        <Link to="/" className="hero-cta">
          BACK HOME
        </Link>
      </main>
    );
  }

  return (
    <main className="event-page">
      {/* Event Hero */}
      <section
        className="event-hero"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <div className="event-hero-overlay" />
        <div className="hero-noise" />
        <div className="event-hero-content">
          <Link to="/" className="back-link">
            ← ALL EVENTS
          </Link>
          <p className="hero-eyebrow">
            {event.venue} · {event.location}
          </p>
          <h1 className="event-hero-title">
            {event.title.split(" ").map((w, i) => (
              <span key={i} className="hero-line">
                {w}
              </span>
            ))}
          </h1>
          <div className="event-meta-row">
            <span className="event-meta-pill">
              {new Date(event.date)
                .toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                .toUpperCase()}
            </span>
            <span className="event-meta-pill">{event.time}</span>
            <span className="event-meta-pill">{event.genre}</span>
          </div>
          <p className="event-desc">{event.description}</p>
        </div>
      </section>

      {/* Request + List */}
      <section className="request-section">
        <div className="request-inner">
          {/* Search box */}
          <div className="search-block">
            <div className="section-label">ADD YOUR TRACK</div>
            <h2 className="section-heading">
              WHAT DO
              <br />
              YOU WANT
              <br />
              <span className="accent">PLAYED?</span>
            </h2>
            <form className="search-form" onSubmit={handleSearch}>
              {selectedTrack ? (
                <div className="search-bar-selected">
                  <img
                    src={selectedTrack.coverSmall}
                    alt={selectedTrack.album}
                    className="search-bar-cover"
                  />
                  <div className="search-bar-info">
                    <span className="search-bar-title">
                      {selectedTrack.title}
                    </span>
                    <span className="search-bar-artist">
                      {selectedTrack.artist}
                    </span>
                  </div>
                  <button
                    className="add-queue-btn"
                    type="button"
                    onClick={addToQueue}
                  >
                    ADD TO QUEUE
                  </button>
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={clearSelection}
                    title="Clear"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="search-input-wrap">
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Type a track or artist…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    autoFocus
                  />
                  {searching && <span className="search-spinner" />}
                </div>
              )}
            </form>

            {searchError && <p className="search-error">{searchError}</p>}

            {!selectedTrack && results.length > 0 && (
              <ul className="search-results">
                {results.map((track) => (
                  <li
                    key={track.id}
                    className="search-result-item"
                    onClick={() => selectResult(track)}
                  >
                    <img
                      src={track.coverSmall}
                      alt={track.album}
                      className="result-cover"
                    />
                    <div className="result-info">
                      <span className="result-title">{track.title}</span>
                      <span className="result-artist">{track.artist}</span>
                    </div>
                    <span className="result-select-hint">SELECT</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Requests list */}
          <div className="requests-block">
            <div className="section-label">CURRENT REQUESTS</div>
            <h2 className="section-heading">
              THE
              <br />
              <span className="accent">QUEUE</span>
            </h2>

            {loadingQueue ? (
              <div className="empty-queue">
                <span
                  className="search-spinner"
                  style={{ position: "static", width: 24, height: 24 }}
                />
                <p>Loading queue…</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="empty-queue">
                <span className="empty-icon">🎵</span>
                <p>No requests yet. Be the first to add a track.</p>
              </div>
            ) : (
              <ol className="requests-list">
                {sorted.map((track, idx) => (
                  <li
                    key={track.fbKey}
                    className={`request-item ${idx === 0 ? "top-request" : ""} ${blinkId === track.fbKey ? "blink-green" : ""}`}
                  >
                    <span className="request-rank">#{idx + 1}</span>
                    <div className="request-cover-wrap">
                      <img
                        src={track.cover}
                        alt={track.album}
                        className="request-cover"
                      />
                      {track.preview && (
                        <button
                          className={`play-btn ${preview === (track.fbKey || track.id) ? "playing" : ""}`}
                          onClick={() => togglePreview(track)}
                          title={
                            preview === (track.fbKey || track.id)
                              ? "Pause preview"
                              : "Play 30s preview"
                          }
                        >
                          {preview === (track.fbKey || track.id) ? "⏸" : "▶"}
                        </button>
                      )}
                    </div>
                    <div className="request-info">
                      <span className="request-title">{track.title}</span>
                      <span className="request-artist">{track.artist}</span>
                      {track.album && (
                        <span className="request-album">{track.album}</span>
                      )}
                    </div>
                    <div className="vote-block">
                      <button
                        className={`vote-btn ${hasVoted(track) ? "voted" : ""}`}
                        onClick={() => vote(track)}
                        disabled={hasVoted(track)}
                        title={
                          hasVoted(track)
                            ? "Already voted"
                            : "Vote for this track"
                        }
                      >
                        ▲
                      </button>
                      <span className="vote-count">{track.votes}</span>
                      <span className="vote-label">VOTES</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      <audio ref={audioRef} onEnded={() => setPreview(null)} />

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
