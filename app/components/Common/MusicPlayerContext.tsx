"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MusicPlayer } from '@/app/common/MusicPlayer';
import playerManager from '@/app/common/MusicPlayerManager';
import { AudioTrack } from '@/app/types/music-player';

interface PlayerContextType {
  player: MusicPlayer;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  playTrack: (track: AudioTrack) => Promise<boolean>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const player = playerManager.getPlayer();
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    const handlePlay = (time: number) => {
      setIsPlaying(true);
      setCurrentTime(time);
    };

    const handlePause = (time: number) => {
      console.log('---handlePause-',time);
      setIsPlaying(false);
      setCurrentTime(time);
    };

    const handleStop = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleTimeUpdate = (time: number) => {
      setCurrentTime(time);
    };

    const handleTrackChange = (track: AudioTrack) => {
      setCurrentTrack(track);
      setDuration(track.duration || 0);
    };

    const handleVolumeChange = (vol: number) => {
      setVolume(vol);
    };
    if (!player) return;
    player.on('play', handlePlay);
    player.on('pause', handlePause);
    player.on('stop', handleStop);
    player.on('timeupdate', handleTimeUpdate);
    player.on('trackchange', handleTrackChange);
    player.on('volumechange', handleVolumeChange);

    return () => {
      player.off('play', handlePlay);
      player.off('pause', handlePause);
      player.off('stop', handleStop);
      player.off('timeupdate', handleTimeUpdate);
      player.off('trackchange', handleTrackChange);
      player.off('volumechange', handleVolumeChange);
    };
  }, [player]);
  if (!player) return;
  const play = () => player.play();
  const pause = () => player.pause();
  const seek = (time: number) => player.seek(time);
  const setVol = (vol: number) => player.setVolume(vol);
  const playTrack = async (track: AudioTrack) => {
    const loaded = await player.load(track);
    if (loaded) {
      return player.play();
    }
    return false;
  };

  const contextValue: PlayerContextType = {
    player,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    setVolume: setVol,
    playTrack
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};