import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "admin-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const http = axios.create();
http.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err?.config?.url || "";
    const is401 = err?.response?.status === 401;
    if (is401 && url.includes("/admin/") && !url.endsWith("/admin/login")) {
      clearToken();
      window.dispatchEvent(new Event("admin-unauthorized"));
    }
    return Promise.reject(err);
  }
);

const auth = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const adminLogin = (password) => axios.post(`${API}/admin/login`, { password }).then((r) => r.data);
export const adminVerify = () => http.get(`${API}/admin/verify`, auth()).then((r) => r.data);

export const adminCreate = (payload) => http.post(`${API}/admin/lessons`, payload, auth()).then((r) => r.data);
export const adminUpdate = (id, payload) => http.put(`${API}/admin/lessons/${id}`, payload, auth()).then((r) => r.data);
export const adminDelete = (id) => http.delete(`${API}/admin/lessons/${id}`, auth()).then((r) => r.data);
export const adminReorder = (gradeId, orderedIds) => http.post(`${API}/admin/lessons/reorder`, { gradeId, orderedIds }, auth()).then((r) => r.data);

export const adminCreateGrade = (payload) => http.post(`${API}/admin/grades`, payload, auth()).then((r) => r.data);
export const adminUpdateGrade = (id, payload) => http.put(`${API}/admin/grades/${id}`, payload, auth()).then((r) => r.data);
export const adminDeleteGrade = (id) => http.delete(`${API}/admin/grades/${id}`, auth()).then((r) => r.data);
export const adminRenameChapter = (gradeId, oldName, newName) => http.post(`${API}/admin/chapters/rename`, { gradeId, old: oldName, new: newName }, auth()).then((r) => r.data);
