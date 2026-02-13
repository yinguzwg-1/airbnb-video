import { MetadataRoute } from 'next'

// 基础站点地图（Next.js 自动生成 /sitemap.xml）
// 动态图片/视频站点地图通过 /api/sitemap-media 提供
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zwg.autos"
  const languages = ['zh', 'en']
  
  const routes = languages.flatMap((lang) => [
    {
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  ])

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...routes,
  ]
}
