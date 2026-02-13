import { NextResponse } from 'next/server';

interface MediaItem {
  id: number;
  url: string;
  coverUrl?: string;
  title?: string;
  width?: number;
  height?: number;
  duration?: number;
  type?: string;
  createdAt?: string;
}

// 获取所有媒体数据（图片+视频）
async function fetchAllMedia(): Promise<MediaItem[]> {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const items: MediaItem[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 50) {
    try {
      const res = await fetch(`${baseUrl}/api/upload/list?page=${page}&limit=100&category=all`, {
        next: { revalidate: 3600 }, // 1 小时缓存
      });
      if (!res.ok) break;
      const data = await res.json();
      items.push(...(data.data || []));
      hasMore = data.hasMore;
      page++;
    } catch {
      break;
    }
  }

  return items;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zwg.autos';
  const media = await fetchAllMedia();

  const photos = media.filter(m => m.type === 'photo' || m.type === 'live');
  const videos = media.filter(m => m.type === 'video');

  // 构建图片条目
  const imageEntries = photos.map(photo => {
    const imageUrl = photo.url.startsWith('http') ? photo.url : `${siteUrl}${photo.url}`;
    const title = photo.title ? escapeXml(photo.title) : 'Photography';
    return `
    <url>
      <loc>${siteUrl}/zh</loc>
      <image:image>
        <image:loc>${escapeXml(imageUrl)}</image:loc>
        <image:title>${title}</image:title>
      </image:image>
    </url>`;
  });

  // 构建视频条目
  const videoEntries = videos.map(video => {
    const videoUrl = video.url.startsWith('http') ? video.url : `${siteUrl}${video.url}`;
    const thumbUrl = video.coverUrl
      ? (video.coverUrl.startsWith('http') ? video.coverUrl : `${siteUrl}${video.coverUrl}`)
      : `${siteUrl}/favicon.png`;
    const title = video.title ? escapeXml(video.title) : 'Video';
    const duration = video.duration || 0;
    const dateStr = video.createdAt ? new Date(video.createdAt).toISOString() : new Date().toISOString();

    return `
    <url>
      <loc>${siteUrl}/zh</loc>
      <video:video>
        <video:thumbnail_loc>${escapeXml(thumbUrl)}</video:thumbnail_loc>
        <video:title>${title}</video:title>
        <video:description>${title}</video:description>
        <video:content_loc>${escapeXml(videoUrl)}</video:content_loc>
        ${duration > 0 ? `<video:duration>${Math.floor(duration)}</video:duration>` : ''}
        <video:publication_date>${dateStr}</video:publication_date>
      </video:video>
    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/zh</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/en</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${imageEntries.join('')}${videoEntries.join('')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
