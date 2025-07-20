import { burryPointService } from '@/app/services/burryPointService';
import { UserEventsResponse, ApiResponse } from '@/app/types/tracker';

export async function getBurryPointData(
  {page}: {page: string}
): Promise<ApiResponse<UserEventsResponse> | null> {
  try {
    // 获取埋点数据
    const data = await burryPointService.getTrackerEvents({page});
    return data;
  } catch (error) {
    console.error('获取埋点数据失败:', error);
    return null;
  }
} 