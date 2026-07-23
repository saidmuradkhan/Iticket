import { useState, useEffect } from "react";
import { getEvents, getShows } from "../api/api";

// tədbirlər və tamaşaları birləşdirib tək massivdə qaytarır
export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEvents(), getShows()]).then(([eventsRes, showsRes]) => {
      setEvents([...eventsRes.data, ...showsRes.data]);
      setLoading(false);
    });
  }, []);

  return { events, loading };
};
