import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
const app = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const http = {
  get: (url, config) => app.get(url, config),
  post: (url, data, config) => app.post(url, data, config),
  patch: (url, data, config) => app.patch(url, data, config),
  put: (url, data, config) => app.put(url, data, config),
  delete: (url, config) => app.delete(url, config),
};

let refreshPromise = null;

app.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const requestUrl = originalConfig?.url || "";
    const isAuthEndpoint = /\/user\/(signin|signup|refresh-token)(?:[/?]|$)/.test(requestUrl);

    if (error.response?.status !== 401 || !originalConfig || originalConfig._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        if (!baseURL) throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:refresh-start"));
        }
        refreshPromise = axios
          .get(`${baseURL}/user/refresh-token`, { withCredentials: true })
          .finally(() => {
            refreshPromise = null;
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("auth:refresh-end"));
            }
          });
      }

      await refreshPromise;
      return app(originalConfig);
    } catch (refreshError) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:session-expired"));
      }
      return Promise.reject(refreshError);
    }
  },
);

export default http;
