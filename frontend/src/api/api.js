import axios from "axios";

const defaultBase =
  import.meta.env.MODE === "production"
    ? "https://zorvyn-2-78z1.onrender.com/api"
    : "http://localhost:5000/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBase,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;