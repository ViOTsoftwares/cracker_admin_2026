import axios from "axios";
import { ENV } from "./env";
import { toastMessage } from "@/lib/toast.message";

const api = axios.create({
  baseURL: ENV.API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to immediately log out on 401 / 403 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== "undefined") {
        console.warn("[Admin Interceptor] 401/403 Unauthorized detected. Logging out immediately.");
        localStorage.removeItem("adminToken");
        document.cookie = "adminToken=; path=/; max-age=0;";
        document.cookie = "adminRestriction=; path=/; max-age=0;";
        document.cookie = "adminRole=; path=/; max-age=0;";
        document.cookie = "adminPermPaths=; path=/; max-age=0;";

        if (!window.location.pathname.startsWith("/signin")) {
          toastMessage("Session expired or unauthorized. Please sign in again.", "error");
          window.location.href = "/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
