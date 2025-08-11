
import { Language } from "../../i18n";
import { musicService } from '@/app/services/musicService';
import { PlayerProvider } from '@/app/components/Common/MusicPlayerContext';
import MusicHomePage from '@/app/components/MusicHomePage';
import { Music } from "@/app/types/music";
interface MusicPageProps {
  params: { musicList: Music[], lang: Language };
}

export default function MusicPage({ params }: MusicPageProps) {
 
 
  return (<PlayerProvider>
    <MusicHomePage musicList={params.musicList} lang={params.lang} />
  </PlayerProvider>);
} 

export async function getServerSideProps({ params }: MusicPageProps) {
  const { musicList } = await musicService.getMusicList();
  return {
    props: {
      musicList,
      lang: params.lang
    }
  }
}