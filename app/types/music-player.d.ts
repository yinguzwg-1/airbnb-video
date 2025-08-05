
export interface AudioTrack {
  src: string;
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  duration?: number;
  buffer?: AudioBuffer;
  lyrics?: { time: number; text: string; }[];
}

interface PlayerEventMap {
  play: (currentTime: number) => void;
  pause: (currentTime: number) => void;
  stop: () => void;
  ended: () => void;
  timeupdate: (currentTime: number) => void;
  volumechange: (volume: number) => void;
  trackchange: (track: AudioTrack) => void;
  error: (error: Error) => void;
}

type PlayerEvent = keyof PlayerEventMap;
type PlayerEventListener<T extends PlayerEvent> = PlayerEventMap[T];