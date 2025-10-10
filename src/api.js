import axios from "axios";

/** ====== Konfiqurasiya ====== */
const RAW_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://172.20.5.167:8000";

export const API_BASE = RAW_BASE.replace(/\/+$/, "");
const TOKEN_URL = `${API_BASE}/api/token/`;
const REFRESH_URL = `${API_BASE}/api/token/refresh/`;

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USERID_KEY = "user_id";
const JOBTYPE_KEY = "user_jobtype";

/** ====== LocalStorage helper-lər ====== */
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY) || null;
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY) || null;
export const getUserId = () => localStorage.getItem(USERID_KEY) || null;
export const getUserJobtype = () =>
  (localStorage.getItem(JOBTYPE_KEY) || "").toLowerCase() || null;

export const setTokens = ({ access, refresh, user_id, jobtype }) => {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user_id) localStorage.setItem(USERID_KEY, String(user_id));
  if (jobtype) localStorage.setItem(JOBTYPE_KEY, String(jobtype));
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USERID_KEY);
  localStorage.removeItem(JOBTYPE_KEY);
};

export const isAuthenticated = () => Boolean(getAccessToken());

/** ====== Axios instance ====== */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

/** ====== Request: Bearer ====== */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** ====== Refresh queue ====== */
let isRefreshing = false;
let pendingQueue = [];
const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

/** ====== Response: 401 → refresh ====== */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config || {};
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (t) => {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${t}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          REFRESH_URL,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        const newAccess = data?.access;
        const newRefresh = data?.refresh;

        if (!newAccess) throw new Error("Refresh cavabında access token yoxdur");

        setTokens({
          access: newAccess,
          refresh: newRefresh || refreshToken,
          user_id: getUserId(),
          jobtype: getUserJobtype(),
        });

        processQueue(null, newAccess);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

/** ====== Util: JWT decode ====== */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function normalizeJobtype(v) {
  if (!v) return null;
  const s = String(v).toLowerCase();
  if (["staff", "hr", "lead", "teamlead", "ceo"].includes(s)) return s;
  if (s.includes("team")) return "teamlead";
  if (s.includes("leader")) return "lead";
  return s;
}

/** ====== Auth API ====== */
export async function loginUsernamePassword(username, password) {
  const { data } = await axios.post(
    TOKEN_URL,
    { username, password },
    { headers: { "Content-Type": "application/json" } }
  );

  let jobtype =
    data?.jobtype || data?.job_type || data?.role || data?.status || null;

  if (!jobtype && data?.access) {
    const payload = parseJwt(data.access) || {};
    jobtype =
      payload.jobtype ||
      payload.job_type ||
      payload.role ||
      payload.status ||
      payload.user_type ||
      null;
  }

  jobtype = normalizeJobtype(jobtype);

  setTokens({
    access: data?.access,
    refresh: data?.refresh,
    user_id: data?.user_id,
    jobtype,
  });

  // 🔹 Əlavə: token + jobtype tam yazıldığından əmin ol
  await ensureJobtypeInStorage();

  return data;
}

/** ====== Fallback: jobtype yoxdursa ====== */
export async function ensureJobtypeInStorage() {
  let jt = getUserJobtype();
  if (jt) return jt;

  const uid = getUserId();
  const at = getAccessToken();
  if (!uid || !at) return null;

  try {
    const res = await api.get(`/api/users/${uid}/`);
    const serverJT =
      res?.data?.jobtype ||
      res?.data?.job_type ||
      res?.data?.role ||
      res?.data?.status ||
      null;
    const norm = normalizeJobtype(serverJT);
    if (norm) {
      setTokens({
        access: getAccessToken(),
        refresh: getRefreshToken(),
        user_id: uid,
        jobtype: norm,
      });
      return norm;
    }
  } catch {
    // ignore
  }
  return null;
}

export function logout() {
  clearTokens();
  window.location.replace("/login");
}

/** ====== Generic helpers ====== */
export const get = (url, config) => api.get(url, config).then((r) => r.data);
export const del = (url, config) => api.delete(url, config).then((r) => r.data);
export const post = (url, body, config) =>
  api.post(url, body, config).then((r) => r.data);
export const put = (url, body, config) =>
  api.put(url, body, config).then((r) => r.data);
export const patch = (url, body, config) =>
  api.patch(url, body, config).then((r) => r.data);

export default api;
