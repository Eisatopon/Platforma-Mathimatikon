import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || "https://platforma-mathimatikon.onrender.com"}/api`;

export const fetchGrades = () => axios.get(`${API}/grades`).then((r) => r.data);
export const fetchAllLessons = () => axios.get(`${API}/lessons`).then((r) => r.data);
export const fetchGrade = (id) => axios.get(`${API}/grades/${id}`).then((r) => r.data);
export const fetchLesson = (id) => axios.get(`${API}/lessons/${id}`).then((r) => r.data);
export const fetchBooks = () => axios.get(`${API}/books`).then((r) => r.data);
