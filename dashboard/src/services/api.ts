// src/services/api.ts
import axios from "axios";
import type { Metric, Alert, Trends } from "@/types";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  timeout: 10000,
});

// metrics
export const getMetrics = (host?: string, limit = 200) =>
  API.get<Metric[]>("/metrics", { params: { host, limit } }).then(r => r.data);

export const postMetric = (payload: Partial<Metric>) =>
  API.post("/metrics", payload);

// alerts
// backend actual tiene GET /alerts/active
export const getAlerts = () => API.get<Alert[]>("/alerts/active").then(r => r.data);

// si no tienes endpoint resolve en backend, coméntalo o implementa en backend
export const resolveAlert = (id: number) =>
  API.post(`/alerts/${id}/resolve`); // <-- Asegúrate de tener este endpoint en backend

// analytics / predictions: comentar si no existen aún
export const getTrends = () =>
  API.get<Trends>("/analytics/trends").then(r => r.data);

export const getPredictions = (host: string) =>
  API.get(`/predictions`, { params: { host } }).then(r => r.data);