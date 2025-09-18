import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend API
});

export default api;
