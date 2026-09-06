import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "admin-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const auth = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const adminLogin = (password) => axios.post(`${API}/admin/login`, { password }).then((r) => r.data);
export const adminVerify = () => axios.get(`${API}/admin/verify`, auth()).then((r) => r.data);
export const adminCreate = (payload) => axios.post(`${API}/admin/lessons`, payload, auth()).then((r) => r.data);
export const adminUpdate = (id, payload) => axios.put(`${API}/admin/lessons/${id}`, payload, auth()).then((r) => r.data);
export const adminDelete = (id) => axios.delete(`${API}/admin/lessons/${id}`, auth()).then((r) => r.data);
