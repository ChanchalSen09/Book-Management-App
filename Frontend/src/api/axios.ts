import axios from "axios";
const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: BACKEND_URL,
});

export default api;
