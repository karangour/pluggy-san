import { useState, useEffect } from "react";
import { ref, set, remove, onValue, update } from "firebase/database";
import { db } from "../firebase";
import { useEvents } from "../hooks/useEvents";

const ADMIN_PASSWORD = "pluggysan2026";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  title: "",
  date: "",
  time: "",
  venue: "",
  location: "",
  genre: "",
  description: "",
  image: "",
};

function EventEditor({ ev, onClose }) {
  const [editForm, setEditForm] = useState({ ...ev });
  const [tracks, setTracks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null); // fbKey of track being edited
  const [trackEdit, setTrackEdit] = useState({});

  useEffect(() => {
    const unsub = onValue(ref(db, `events/${ev.id}/requests`), (snap) => {
      const data = snap.val();
      if (!data) {
        setTracks([]);
        return;
      }
      setTracks(
        Object.entries(data)
          .map(([fbKey, val]) => ({ fbKey, ...val }))
          .sort((a, b) => b.votes - a.votes),
      );
    });
    return () => unsub();
  }, [ev.id]);

  async function saveInfo(e) {
    e.preventDefault();
    setSaving(true);
    const { title, date, time, venue, location, genre, description, image } =
      editForm;
    await set(ref(db, `events/${ev.id}/info`), {
      title,
      date,
      time,
      venue,
      location,
      genre,
      description,
      image,
    });
    setSaving(false);
    onClose();
  }

  async function deleteTrack(fbKey) {
    await remove(ref(db, `events/${ev.id}/requests/${fbKey}`));
  }

  async function saveTrack(fbKey) {
    await update(ref(db, `events/${ev.id}/requests/${fbKey}`), trackEdit);
    setEditingTrack(null);
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <span className="admin-editor-title">EDITING: {ev.title}</span>
        <button className="admin-logout" onClick={onClose}>
          CLOSE
        </button>
      </div>

      {/* Event info edit */}
      <form
        className="admin-form"
        onSubmit={saveInfo}
        style={{ marginBottom: 32 }}
      >
        <div className="section-label" style={{ marginBottom: 16 }}>
          EVENT INFO
        </div>
        <div className="admin-form-row">
          <label>
            <span>Title</span>
            <input
              name="title"
              className="search-input"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Date</span>
            <input
              name="date"
              type="date"
              className="search-input"
              value={editForm.date}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, date: e.target.value }))
              }
              required
            />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            <span>Venue</span>
            <input
              name="venue"
              className="search-input"
              value={editForm.venue}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, venue: e.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Time</span>
            <input
              name="time"
              className="search-input"
              value={editForm.time || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, time: e.target.value }))
              }
            />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            <span>Location</span>
            <input
              name="location"
              className="search-input"
              value={editForm.location || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, location: e.target.value }))
              }
            />
          </label>
          <label>
            <span>Genre</span>
            <input
              name="genre"
              className="search-input"
              value={editForm.genre || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, genre: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="admin-full">
          <span>Description</span>
          <textarea
            className="search-input admin-textarea"
            value={editForm.description || ""}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </label>
        <label className="admin-full">
          <span>Cover Image URL</span>
          <input
            className="search-input"
            value={editForm.image || ""}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, image: e.target.value }))
            }
          />
        </label>
        {editForm.image && (
          <div className="admin-img-preview">
            <img src={editForm.image} alt="preview" />
          </div>
        )}
        <button
          className="add-queue-btn"
          type="submit"
          disabled={saving}
          style={{ alignSelf: "flex-start", marginTop: 8 }}
        >
          {saving ? "SAVING…" : "SAVE CHANGES"}
        </button>
      </form>

      {/* Track queue */}
      <div className="section-label" style={{ marginBottom: 16 }}>
        TRACK QUEUE ({tracks.length})
      </div>
      {tracks.length === 0 ? (
        <p className="admin-muted">No tracks in queue.</p>
      ) : (
        <ul className="admin-track-list">
          {tracks.map((t) => (
            <li key={t.fbKey} className="admin-track-item">
              {t.cover && (
                <img
                  src={t.cover}
                  alt={t.title}
                  className="admin-track-cover"
                />
              )}
              {editingTrack === t.fbKey ? (
                <div className="admin-track-edit-fields">
                  <input
                    className="search-input"
                    value={trackEdit.title || ""}
                    onChange={(e) =>
                      setTrackEdit((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Title"
                  />
                  <input
                    className="search-input"
                    value={trackEdit.artist || ""}
                    onChange={(e) =>
                      setTrackEdit((p) => ({ ...p, artist: e.target.value }))
                    }
                    placeholder="Artist"
                  />
                </div>
              ) : (
                <div className="admin-track-info">
                  <span className="admin-track-title">{t.title}</span>
                  <span className="admin-track-meta">
                    {t.artist} · {t.votes} vote{t.votes !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="admin-track-actions">
                {editingTrack === t.fbKey ? (
                  <>
                    <button
                      className="admin-img-tab active"
                      onClick={() => saveTrack(t.fbKey)}
                    >
                      SAVE
                    </button>
                    <button
                      className="admin-img-tab"
                      onClick={() => setEditingTrack(null)}
                    >
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button
                    className="admin-img-tab"
                    onClick={() => {
                      setEditingTrack(t.fbKey);
                      setTrackEdit({ title: t.title, artist: t.artist });
                    }}
                  >
                    EDIT
                  </button>
                )}
                <button
                  className="admin-delete-btn"
                  onClick={() => deleteTrack(t.fbKey)}
                >
                  DELETE
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("pluggy_admin") === "yes",
  );
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  const { events, loading } = useEvents();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [imgMode, setImgMode] = useState("url"); // "url" | "upload" | "random"
  const [randomLoading, setRandomLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function login(e) {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("pluggy_admin", "yes");
      setAuthed(true);
    } else {
      setPwError(true);
    }
  }

  function logout() {
    sessionStorage.removeItem("pluggy_admin");
    setAuthed(false);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((prev) => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

  async function fetchRandomImage() {
    setRandomLoading(true);
    const genrePart = form.genre ? form.genre.split("/")[0].trim() : "";
    const term = encodeURIComponent(
      [genrePart, "club"].filter(Boolean).join(" ") || "dj nightclub",
    );
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${term}&orientation=landscape&content_filter=high`,
        {
          headers: {
            Authorization:
              "Client-ID 4nelHVA5Qnn1RRgvcnQxGIT1y7CbiaBQG_gjf_b41zI",
          },
        },
      );
      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.urls.regular }));
    } catch {
      setForm((prev) => ({ ...prev, image: "" }));
    } finally {
      setRandomLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return;
    setSaving(true);
    setSaveMsg("");
    const id = slugify(form.title);
    await set(ref(db, `events/${id}/info`), { ...form });
    setForm(EMPTY_FORM);
    setSaveMsg(`Event "${form.title}" created!`);
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}" and all its requests?`)) return;
    await remove(ref(db, `events/${id}`));
  }

  if (!authed) {
    return (
      <main className="admin-gate">
        <div className="hero-noise" />
        <div className="admin-gate-box">
          <div className="admin-logo">
            <img
              src="/Pluggy San Logo.png"
              alt="Pluggy San"
              className="footer-logo-img"
            />
          </div>
          <p className="hero-eyebrow">Admin Access</p>
          <form onSubmit={login} className="admin-login-form">
            <input
              className="search-input"
              type="password"
              placeholder="Enter password…"
              value={pwInput}
              onChange={(e) => {
                setPwInput(e.target.value);
                setPwError(false);
              }}
              autoFocus
            />
            {pwError && <p className="search-error">Incorrect password.</p>}
            <button className="hero-cta" type="submit">
              ENTER
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div className="admin-logo">
          <span className="admin-logout">ADMIN</span>
        </div>
        <button className="admin-logout" onClick={logout}>
          LOG OUT
        </button>
      </div>

      <div className="admin-inner">
        {/* Create event */}
        <section className="admin-section">
          <div className="section-label">NEW EVENT</div>
          <h2
            className="section-heading"
            style={{ fontSize: "clamp(32px,5vw,56px)", marginBottom: 32 }}
          >
            CREATE AN
            <br />
            <span className="accent">EVENT</span>
          </h2>
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="admin-form-row">
              <label>
                <span>Event Title *</span>
                <input
                  name="title"
                  className="search-input"
                  placeholder="e.g. Club Night Amsterdam"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <span>Date *</span>
                <input
                  name="date"
                  type="date"
                  className="search-input"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
            <div className="admin-form-row">
              <label>
                <span>Venue *</span>
                <input
                  name="venue"
                  className="search-input"
                  placeholder="e.g. Shelter Amsterdam"
                  value={form.venue}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <span>Time</span>
                <input
                  name="time"
                  className="search-input"
                  placeholder="e.g. 23:00 – 06:00"
                  value={form.time}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div className="admin-form-row">
              <label>
                <span>Location</span>
                <input
                  name="location"
                  className="search-input"
                  placeholder="e.g. Amsterdam, NL"
                  value={form.location}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>Genre</span>
                <input
                  name="genre"
                  className="search-input"
                  placeholder="e.g. Hip-Hop / Afrobeats"
                  value={form.genre}
                  onChange={handleChange}
                />
              </label>
            </div>
            <label className="admin-full">
              <span>Description</span>
              <textarea
                name="description"
                className="search-input admin-textarea"
                placeholder="Short description of the event…"
                value={form.description}
                onChange={handleChange}
              />
            </label>
            <div
              className={`admin-full${!(form.title && form.date && form.venue && form.genre) ? " admin-field-locked" : ""}`}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Cover Image
                {!(form.title && form.date && form.venue && form.genre) && (
                  <span className="admin-lock-hint">
                    {" "}
                    — fill Title, Date, Venue &amp; Genre first
                  </span>
                )}
              </span>
              <div className="admin-img-tabs">
                {["url", "upload", "random"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`admin-img-tab ${imgMode === m ? "active" : ""}`}
                    onClick={() => {
                      setImgMode(m);
                      setForm((p) => ({ ...p, image: "" }));
                    }}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
              {imgMode === "url" && (
                <input
                  name="image"
                  className="search-input"
                  placeholder="https://images.unsplash.com/…"
                  value={form.image}
                  onChange={handleChange}
                />
              )}
              {imgMode === "upload" && (
                <input
                  type="file"
                  accept="image/*"
                  className="search-input"
                  onChange={handleFileUpload}
                  style={{ padding: "10px" }}
                />
              )}
              {imgMode === "random" && (
                <button
                  type="button"
                  className="add-queue-btn"
                  onClick={fetchRandomImage}
                  disabled={randomLoading}
                  style={{ alignSelf: "flex-start" }}
                >
                  {randomLoading
                    ? "FETCHING…"
                    : form.image
                      ? "↻ NEW RANDOM"
                      : "GET RANDOM IMAGE"}
                </button>
              )}
            </div>
            {form.image && (
              <div className="admin-img-preview">
                <img src={form.image} alt="preview" />
              </div>
            )}
            <button
              className="add-queue-btn"
              type="submit"
              disabled={
                saving ||
                !(
                  form.title &&
                  form.date &&
                  form.venue &&
                  form.genre &&
                  form.image
                )
              }
              style={{
                marginTop: 8,
                opacity:
                  form.title &&
                  form.date &&
                  form.venue &&
                  form.genre &&
                  form.image
                    ? 1
                    : 0.4,
                cursor:
                  form.title &&
                  form.date &&
                  form.venue &&
                  form.genre &&
                  form.image
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {saving ? "SAVING…" : "CREATE EVENT"}
            </button>
            {saveMsg && <p className="admin-save-msg">{saveMsg}</p>}
          </form>
        </section>

        {/* Existing events */}
        <section className="admin-section">
          <div className="section-label">MANAGE EVENTS</div>
          <h2
            className="section-heading"
            style={{ fontSize: "clamp(32px,5vw,56px)", marginBottom: 32 }}
          >
            LIVE
            <br />
            <span className="accent">EVENTS</span>
          </h2>
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : events.length === 0 ? (
            <p className="admin-muted">No events yet. Create one above.</p>
          ) : (
            <ul className="admin-events-list">
              {events.map((ev) => (
                <li key={ev.id} className="admin-event-item-wrap">
                  <div className="admin-event-item">
                    {ev.image && (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="admin-event-thumb"
                      />
                    )}
                    <div className="admin-event-info">
                      <span className="admin-event-title">{ev.title}</span>
                      <span className="admin-event-meta">
                        {ev.venue} ·{" "}
                        {new Date(ev.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="admin-event-url">
                        pluggysan.com/event/{ev.id}
                      </span>
                    </div>
                    <button
                      className="admin-img-tab"
                      onClick={() =>
                        setEditingId(editingId === ev.id ? null : ev.id)
                      }
                    >
                      {editingId === ev.id ? "CLOSE" : "EDIT"}
                    </button>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(ev.id, ev.title)}
                    >
                      DELETE
                    </button>
                  </div>
                  {editingId === ev.id && (
                    <EventEditor ev={ev} onClose={() => setEditingId(null)} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
