// src/types/index.ts
export type Metric = {
  id?: number;           // id solo para responses
  host: string;
  cpu_usage: number;
  memory_usage: number;
  latency: number;
  timestamp: string;     // backend devuelve datetime ISO -> string en frontend
};

export type Alert = {
  id: number;
  host: string;
  type: string;
  value: number;
  timestamp: string;
  status: string;
};

// opcional:
export type Trends = {
  // define según lo que el backend devuelva
};