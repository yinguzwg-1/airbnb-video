import { ImageResponse } from 'next/og';
import { i18n } from '../config/i18n';

export const runtime = 'edge';
export const alt = 'Doushabao Photography Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { lang: string } }) {
  const t = i18n[params.lang as 'zh' | 'en'] || i18n.zh;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 30%, #7dd3fc 60%, #e0f2fe 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰性背景圆 */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -60,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* 主标题 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            zIndex: 1,
          }}
        >
          {/* 相机图标 */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            📷
          </div>

          <h1
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.15)',
              margin: 0,
              padding: '0 40px',
            }}
          >
            {t.metadata.ogTitle}
          </h1>

          <p
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.5,
              margin: 0,
              padding: '0 40px',
            }}
          >
            {t.metadata.ogDesc}
          </p>
        </div>

        {/* 底部域名 */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          <span>zwg.autos</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
