import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '豆沙包 - 摄影作品集',
    short_name: '豆沙包',
    description: '探索专业摄影师的精选作品集，提供高质量的视觉享受。',
    start_url: '/zh',
    display: 'standalone',
    background_color: '#f0f9ff',
    theme_color: '#0ea5e9',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon',
      },
    ],
  }
}
