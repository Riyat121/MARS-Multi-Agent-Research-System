import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api/research" });

export const runResearch = (topic) => api.post("/", { topic }).then((r) => r.data);
export const getHistory = () => api.get("/").then((r) => r.data);
export const getResearch = (id) => api.get(`/${id}`).then((r) => r.data);