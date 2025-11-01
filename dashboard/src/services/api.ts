import axios from "axios";
import type { Metric, Alert, Trends } from "@/types";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  timeout: 10000,
});

export const getMetrics = (host?: string, limit = 200) =>
  API.get<Metric[]>("/metrics", { params: { host, limit } }).then(r => r.data);

export const postMetric = (payload: Partial<Metric>) =>
  API.post("/metrics", payload);

export const getAlerts = () => API.get<Alert[]>("/alerts").then(r => r.data);

export const resolveAlert = (id: number) =>
  API.post(`/alerts/${id}/resolve`);

export const getTrends = () =>
  API.get<Trends>("/analytics/trends").then(r => r.data);

export const getPredictions = (host: string) =>
  API.get(`/predictions`, { params: { host } }).then(r => r.data);
