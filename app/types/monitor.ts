export interface MonitorData {
  id: number;
  method: string;
  url: string;
  body: string;
  response: string;
  error: string;
  status_code: number;
  duration: number;
  timestamp: Date;
  query: string;
}