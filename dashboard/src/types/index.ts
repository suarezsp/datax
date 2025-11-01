export interface Metric {
    id: number;
    host: string;
    cpu_usage: number;
    memory_usage: number;
    latency: number;
    timestamp: string;
}

export interface Alert {
    id: number;
    host: string;
    type: string;
    value: number;
    timestamp: string;
    status: 'active' | 'resolved';
}

export interface Trends {
    hosts_count: number;
    cpu_avg: number;
    memory_avg: number;
    latency_avg: number;
    cpu_peak?: number;
}