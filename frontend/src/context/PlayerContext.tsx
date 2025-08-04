import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
  audioUrl: string;
}

interface PlayerContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Track[];
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
}

const PlayerContext = createContext<PlayerContextProps>({} as PlayerContextProps);

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeState, setVolumeState] = useState(70);
  const [progress, setProgress] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audioElement = new Audio();
    audioElement.volume = volumeState / 100;
    
    audioElement.addEventListener('timeupdate', () => {
      if (audioElement.duration) {
        setProgress((audioElement.currentTime / audioElement.duration) * 100);
      }
    });
    
    audioElement.addEventListener('ended', () => {
      nextTrack();
    });
    
    audioElementRef.current = audioElement;
    
    return () => {
      audioElement.pause();
      audioElement.src = '';
      audioElementRef.current = null;
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (audioElement && currentTrack) {
      audioElement.src = currentTrack.audioUrl;
      
      if (isPlaying) {
        audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  }, [currentTrack]);

  // Update volume when changed
  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.volume = volumeState / 100;
      console.log(`Current volume state: ${volumeState}%`);
      console.log(`Actual audio element volume: ${audioElement.volume * 100}%`);
    }
  }, [volumeState]);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.play().catch(error => {
        console.error('Error resuming audio:', error);
      });
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    } else {
      pauseTrack();
      setCurrentTrack(null);
    }
  };

  const prevTrack = () => {
    const audioElement = audioElementRef.current;
    // If more than 3 seconds have passed, restart the current track
    if (audioElement && audioElement.currentTime > 3) {
      audioElement.currentTime = 0;
    } else {
      // Would need track history to implement properly
      console.log('Go to previous track');
    }
  };

  const setVolume = (newVolume: number) => {
    // Make sure newVolume is between 0 and 100
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    
    // Update state
    setVolumeState(clampedVolume);
    
    // Apply to audio element - convert percentage to decimal (0-1)
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.volume = clampedVolume / 100;
      
      // Log to verify it's working
      console.log(`Setting volume to ${clampedVolume}% (${audioElement.volume})`);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue([...queue, track]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue(queue.filter(track => track.id !== trackId));
  };

  const value = {
    currentTrack,
    isPlaying,
    volume: volumeState,
    progress,
    queue,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    prevTrack,
    setVolume,
    addToQueue,
    removeFromQueue
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
