import axios from "axios";
import content from "@/data/content.json";

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

const staticGrade = (id) => {
  const grade = content.grades.find((item) => item.id === id);
  if (!grade) return null;
  return {
    grade,
    books: content.books.filter((item) => item.gradeId === id),
    lessons: content.lessons.filter((item) => item.gradeId === id),
  };
};

const localFirst = (key, value, remoteUrl) => {
  if (value) return Promise.resolve(remember(key, value));
  return axios.get(remoteUrl).then((response) => remember(key, response.data));
};

// Public curriculum is bundled with the app. The API is only a fallback for
// an unknown/new ID, so a sleeping free Render service cannot delay the UI.
export const fetchGrades = () => localFirst("grades", content.grades, `${API}/grades`);
export const fetchAllLessons = () => localFirst("lessons", content.lessons, `${API}/lessons`);
export const fetchGrade = (id) => localFirst(`grade:${id}`, staticGrade(id), `${API}/grades/${id}`);
export const fetchLesson = (id) => localFirst(`lesson:${id}`, content.lessonDetails[id], `${API}/lessons/${id}`);
export const fetchBooks = () => localFirst("books", content.books, `${API}/books`);
