import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || "https://platforma-mathimatikon.onrender.com"}/api`;
const CACHE_PREFIX = "mathtopon-api-v1:";

export const readApiCache = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const remember = (key, value) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage may be unavailable in private browsing; live data still works.
  }
  return value;
};

export const fetchGrades = () => axios.get(`${API}/grades`).then((r) => remember("grades", r.data));
export const fetchAllLessons = () => axios.get(`${API}/lessons`).then((r) => remember("lessons", r.data));
export const fetchGrade = (id) => axios.get(`${API}/grades/${id}`).then((r) => remember(`grade:${id}`, r.data));
export const fetchLesson = (id) => axios.get(`${API}/lessons/${id}`).then((r) => remember(`lesson:${id}`, r.data));
export const fetchBooks = () => axios.get(`${API}/books`).then((r) => remember("books", r.data));
