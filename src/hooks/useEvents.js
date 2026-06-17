import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase";

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventsRef = ref(db, "events");
    const unsub = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const now = Date.now();
      const list = [];
      Object.entries(data).forEach(([id, val]) => {
        if (!val.info) return;
        const eventTime = new Date(val.info.date).getTime();
        if (now - eventTime > FORTY_EIGHT_HOURS) {
          remove(ref(db, `events/${id}`));
        } else {
          list.push({ id, ...val.info });
        }
      });
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { events, loading };
}
