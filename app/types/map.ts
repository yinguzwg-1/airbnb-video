// 城市数据类型
export interface City {
  id: string;
  name: string;           // 城市名称：如 "杭州"
  province: string;       // 省份：如 "浙江省"
  coordinates: [number, number]; // 经纬度 [lng, lat]
  visitDate: string;      // 访问日期
  coverImage: string;     // 封面图
  tags: string[];         // 标签：如 ["美食", "古镇"]
}

// 游记数据类型
export interface TravelStory {
  id: string;
  cityId: string;
  title: string;          // 游记标题
  description: string;    // 描述
  date: string;
  photos: Photo[];
  videos: Video[];
}

// 照片类型
export interface Photo {
  id: string;
  url: string;
  thumbnail: string;      // 缩略图
  caption?: string;
  location?: string;
}

// 视频类型
export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  title: string;
}

// ECharts 散点数据类型
export interface CityScatterData {
  name: string;
  value: (number | string)[];
  cityId: string;
}