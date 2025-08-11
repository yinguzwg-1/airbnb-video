
import { Language } from "../../i18n";
import { musicService } from '@/app/services/musicService';
import { PlayerProvider } from '@/app/components/Common/MusicPlayerContext';
import MusicHomePage from '@/app/components/MusicHomePage';
import { unstable_noStore as noStore } from 'next/cache';
interface MusicPageProps {
  params: { lang: Language };
}

export default async function MusicPage({ params }: MusicPageProps) {
  // 禁用缓存，强制每次请求都获取新数据
  noStore();
  const { musicList } = await musicService.getMusicList();
 
  return (<PlayerProvider>
    <MusicHomePage musicList={musicList} lang={params.lang} />
  </PlayerProvider>);
} 