import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const api = axios.create({ baseURL: `${BASE}/api/research` });

export const wakeServer = () => axios.get(BASE).catch(() => {});
export const runResearch = (topic) => api.post("/", { topic }).then((r) => r.data);
export const getHistory = () => api.get("/").then((r) => r.data);
export const getResearch = (id) => api.get(`/${id}`).then((r) => r.data);