import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("hackathon_token") || localStorage.getItem("hackathon_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("hackathon_token", { path: '/' });
      Cookies.remove("hackathon_user", { path: '/' });
      localStorage.removeItem("hackathon_token");
      localStorage.removeItem("hackathon_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
