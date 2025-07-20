import axios from "axios";
import { config as configApi } from '@/app/config';
import { MonitorData } from "../types";
const API_BASE = configApi.NEXT_PUBLIC_API_URL;

export const monitoringService = {
  async getMonitoringData(): Promise<MonitorData[]>   {
   try {
    const response = await axios.get(`${API_BASE}/monitor`);
    return response.data;
   } catch (error) {
    console.error('获取监控数据失败:', error);
    throw error;
   }
  }
}