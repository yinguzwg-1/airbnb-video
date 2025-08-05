
import { Language } from "../../i18n";
import { musicService } from '@/app/services/musicService';
import { PlayerProvider } from '@/app/components/Common/MusicPlayerContext';
import MusicHomePage from '@/app/components/MusicHomePage';
interface MusicPageProps {
  params: { lang: Language };
}

export default async function MusicPage({ params }: MusicPageProps) {
 
  const { musicList } = await musicService.getMusicList();
 
  return (<PlayerProvider>
    <MusicHomePage musicList={musicList} lang={params.lang} />
  </PlayerProvider>);
} 