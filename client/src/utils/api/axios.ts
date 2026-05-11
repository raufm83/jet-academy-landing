import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { getApiBaseURL } from "@/utils/api/api-base-url";

/** API 401 + mövcud NextAuth cookie → middleware dashboard-a qaytarır → yenə 401 → sonsuz döngü */
let authRedirectAfter401InProgress = false;

export { getApiBaseURL } from "@/utils/api/api-base-url";

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};

    if (typeof window !== "undefined") {
      try {
        const session = await getSession();

        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = undefined;
      config.timeout = 60000;
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    config.headers["Accept"] = "*/*";

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !authRedirectAfter401InProgress) {
        const path = window.location.pathname;
        if (!path.includes("/dashboard/login")) {
          authRedirectAfter401InProgress = true;
          try {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: false });
          } catch (e) {
            console.error("signOut after 401 failed:", e);
          }
          const origin = window.location.origin;
          window.location.replace(`${origin}/dashboard/login/`);
        }
      }
    }

    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });

    return Promise.reject(error);
  }
);

export default api;
