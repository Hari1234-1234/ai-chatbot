import axios from "axios";

// Create one reusable Axios instance for backend API calls.
const axiosInstance = axios.create({
  baseURL: "http://localhost:4200/api",
  withCredentials: true,
});

// Attach JWT only to protected API requests.
axiosInstance.interceptors.request.use(
  (config) => {
    const isPublicRoute =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register");

    if (!isPublicRoute) {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
