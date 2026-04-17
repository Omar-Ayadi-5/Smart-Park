import axios from "axios";
import {
  acquireApiMutex,
  beginApiLoading,
  endApiLoading,
} from "./apiLoadingStore";

const api = axios.create({
  baseURL: "https://smartpark-zqtg.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

function applyAuthHeader(config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function finishTrackedRequest(config) {
  if (config?.skipGlobalLoading) return;
  endApiLoading();
  config?.__releaseApiMutex?.();
}

api.interceptors.request.use(
  async (config) => {
    if (config.skipGlobalLoading) {
      return applyAuthHeader(config);
    }
    beginApiLoading();
    const releaseMutex = await acquireApiMutex();
    config.__releaseApiMutex = releaseMutex;
    try {
      return applyAuthHeader(config);
    } catch (e) {
      endApiLoading();
      releaseMutex();
      throw e;
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    finishTrackedRequest(response.config);
    return response;
  },
  (error) => {
    finishTrackedRequest(error.config);
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = async (email, password) => {
  const res = await api.post("/admin/login", { email, password });
  return res.data;
};

export const registerAdmin = async (email, password, username) => {
  const res = await api.post("/admin/register", { email, password, username });
  return res.data;
};

export const dashboardData = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

export const updateUsername = async (data) => {
  const res = await api.put("/admin/update-username", data);
  return res.data;
};

export const deleteAccount = async () => {
  const res = await api.delete("/admin/delete-account");
  return res.data;
};

export const getAdmins = async () => {
  const res = await api.get("/admin/get-admins");
  return res.data;
};

export const approveAdmin = async (id) => {
  const res = await api.put(`/admin/approve-admin/${id}`);
  return res.data;
};

export const deleteAdmin = async (id) => {
  const res = await api.delete(`/admin/delete-admin/${id}`);
  return res.data;
};

export const getPublicDashboard = async () => {
  const res = await api.get("/parking/dashboard"); 
  return res.data;
};

export const toggleSpotOOS = async (spotId) => {
  const res = await api.patch(`/admin/spot/${spotId}/toggle-oos`);
  return res.data;
};

export default api;