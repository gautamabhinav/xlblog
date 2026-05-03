// import axios from "axios";

// // const BASE_URL = "http://localhost:5014/api/v1";

// // Before (this causes CORS without proxy):
// // const BASE_URL = "http://localhost:5014/api/v1";

// // After (with proxy in place):
// // const BASE_URL = "/api/v1";

// const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

// // const BASE_URL = "https://lms-deploy-y4le.onrender.com/api/v1";


// const axiosInstance = axios.create();

// axiosInstance.defaults.baseURL = BASE_URL;
// axiosInstance.defaults.withCredentials = true;

// export default axiosInstance;



// import axios from "axios";

// const isDev = import.meta.env.MODE === "development";

// const BASE_URL = isDev
//   ? "http://localhost:5014/api/v1"
//   : import.meta.env.VITE_API_URL || "https://blex-thlc.onrender.com/api/v1";

// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// export default axiosInstance;


import axios from "axios";

const isDev = import.meta.env.MODE === "development";

/**
 * IMPORTANT:
 * In production, VITE_API_URL MUST be defined.
 * No Render fallback.
 */
const BASE_URL = isDev
  ? "http://localhost:5014/api/v1"
  : import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not defined in production");
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global response interceptor: handle unauthorized and forbidden centrally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    try {
      // allow requests to opt-out of redirect behavior by setting config.skipAuthRedirect = true
      const cfg = err?.config || {};
      if (cfg.skipAuthRedirect) return Promise.reject(err);

      if (status === 401) {
        // clear auth state then redirect to login
        try {
          // dynamic import to avoid circular dependency between store <-> axiosInstance <-> authSlice
          import('../Redux/store').then((m) => {
            try { m.default.dispatch({ type: 'auth/logout/fulfilled' }); } catch (e) { /* ignore */ }
          }).catch(()=>{});
        } catch (e) { /* ignore */ }
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace(`/login?next=${next}`);
        return Promise.reject(err);
      }
      if (status === 403) {
        try {
          import('../Redux/store').then((m) => {
            try { m.default.dispatch({ type: 'auth/logout/fulfilled' }); } catch (e) { /* ignore */ }
          }).catch(()=>{});
        } catch (e) { /* ignore */ }
        window.location.replace('/denied');
        return Promise.reject(err);
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(err);
  }
);

/* =========================
   API METHODS
========================= */

export const listTests = async () => {
  const { data } = await api.get("/tests");
  return data;
};

export const getTest = async (id) => {
  const { data } = await api.get(`/tests/${id}`);
  return data;
};

export const submitTest = async (id, body) => {
  const { data } = await api.post(`/tests/${id}/submit`, body);
  return data;
};

export const getAttempt = async (id) => {
  const { data } = await api.get(`/tests/attempt/${id}`);
  return data;
};

// console.log("API OBJECT:", api);

export const listAttempts = async () => {
  const { data } = await api.get("/tests/attempts");
  return data;
}


export default api;

