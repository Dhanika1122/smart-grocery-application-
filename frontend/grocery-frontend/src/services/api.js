import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080"
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      localStorage.removeItem("user");

      // Redirect based on current section.
      const path = window.location.pathname || "";
      if (path.startsWith("/admin") || path === "/login" || path === "/admin-register") {
        window.location.href = "/login";
      } else {
        window.location.href = "/userlogin";
      }
    }
    return Promise.reject(error);
  }
);

export default API;