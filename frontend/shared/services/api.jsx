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
  // Le token est stocké côté navigateur après login admin.
  // On l’injecte systématiquement si présent pour les endpoints protégés.
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function finishTrackedRequest(config) {
  if (config?.skipGlobalLoading) return;
  // On termine *toujours* le suivi global, même en cas d’erreur,
  // et on libère le mutex pour permettre à la requête suivante d’avancer.
  endApiLoading();
  config?.__releaseApiMutex?.();
}

api.interceptors.request.use(
  async (config) => {
    if (config.skipGlobalLoading) {
      // Certains appels “silencieux” ne doivent pas bloquer l’UI globale
      // (ex: auto-refresh, pré-chargements, etc.).
      return applyAuthHeader(config);
    }
    beginApiLoading();
    // Mutex: garantit qu’une seule requête “global loading” est active à la fois.
    const releaseMutex = await acquireApiMutex();
    config.__releaseApiMutex = releaseMutex;
    try {
      return applyAuthHeader(config);
    } catch (e) {
      // Si une exception survient avant l’envoi HTTP, on doit nettoyer le tracking.
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
      // Stratégie simple: invalider la session locale si le backend refuse le token.
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
  // Endpoint public: pas de token requis.
  const res = await api.get("/parking/dashboard"); 
  return res.data;
};

export const toggleSpotOOS = async (spotId) => {
  const res = await api.patch(`/admin/spot/${spotId}/toggle-oos`);
  return res.data;
};

export default api;