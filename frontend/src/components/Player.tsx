// frontend/src/components/Player.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  BackwardIcon, 
  ForwardIcon, 
  SpeakerWaveIcon 
} from '@heroicons/react/24/solid';
import { 
  HeartIcon, 
  ArrowPathIcon, 
  ArrowsRightLeftIcon 
} from '@heroicons/react/24/outline';
import { usePlayer } from '../context/PlayerContext';

const Player: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    progress, 
    pauseTrack, 
    resumeTrack, 
    nextTrack, 
    prevTrack, 
    setVolume 
  } = usePlayer();
  
  const [liked, setLiked] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };
  
  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !currentTrack) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    // In a real app, you would seek the audio to this position
    console.log(`Seek to ${pos * 100}%`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };
  
  if (!currentTrack) {
    return (
      <div className="bg-primary-dark border-t border-neutral-dark h-20 px-4 flex items-center justify-center">
        <p className="text-neutral">No track selected</p>
      </div>
    );
  }
  
  // Calculate current time based on progress percentage and track duration
  const currentTimeInSeconds = (progress / 100) * currentTrack.duration;
  
  return (
    <div className="bg-primary-dark border-t border-neutral-dark px-4 py-3 flex items-center">
      {/* Track Info */}
      <div className="flex items-center w-1/4">
        <img 
          src={currentTrack.coverUrl || "/placeholder-album.jpg"} 
          alt={`${currentTrack.title} cover`} 
          className="h-14 w-14 rounded-md shadow-lg"
        />
        <div className="ml-3">
          <h4 className="text-neutral-light text-sm font-medium">{currentTrack.title}</h4>
          <p className="text-neutral text-xs">{currentTrack.artist}</p>
        </div>
        <button 
          className={`ml-4 focus:outline-none ${liked ? 'text-secondary' : 'text-neutral hover:text-secondary'}`}
          onClick={() => setLiked(!liked)}
        >
          <HeartIcon className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      {/* Player Controls */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex items-center mb-2">
          <button className="text-neutral mx-2 hover:text-neutral-light focus:outline-none">
            <ArrowsRightLeftIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-neutral mx-2 hover:text-neutral-light focus:outline-none"
            onClick={prevTrack}
          >
            <BackwardIcon className="h-5 w-5" />
          </button>
          
          <button 
            className="bg-secondary rounded-full p-2 mx-4 focus:outline-none hover:bg-secondary-light"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6 text-primary" />
            ) : (
              <PlayIcon className="h-6 w-6 text-primary" />
            )}
          </button>
          
          <button 
            className="text-neutral mx-2 hover:text-neutral-light focus:outline-none"
            onClick={nextTrack}
          >
            <ForwardIcon className="h-5 w-5" />
          </button>
          <button className="text-neutral mx-2 hover:text-neutral-light focus:outline-none">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center w-full px-4">
          <span className="text-xs text-neutral w-10 text-right">
            {formatTime(currentTimeInSeconds)}
          </span>
          <div className="mx-3 w-full" onClick={handleProgressChange} ref={progressBarRef}>
            <div className="h-1 bg-neutral-dark rounded-full cursor-pointer">
              <div 
                className="h-full bg-secondary rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-neutral-light rounded-full shadow-md opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>
          </div>
          <span className="text-xs text-neutral w-10">
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>
      
      {/* Volume Control */}
      <div className="w-1/4 flex items-center justify-end">
        <div 
          className="relative"
          onMouseEnter={() => setShowVolumeControl(true)}
          onMouseLeave={() => setShowVolumeControl(false)}
        >
          <button className="text-neutral hover:text-neutral-light focus:outline-none">
            <SpeakerWaveIcon className="h-5 w-5" />
          </button>
          
          {showVolumeControl && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-primary-light rounded shadow-lg">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 appearance-none bg-neutral-dark rounded-full"
                style={{
                  background: `linear-gradient(to right, #B3B3B3 0%, #B3B3B3 ${volume}%, #727272 ${volume}%, #727272 100%)`,
                }}
              />
            </div>
          )}
        </div>
        
        <div className="ml-4 w-24 hidden md:block">
          <div className="h-1 bg-neutral-dark rounded-full">
            <div 
              className="h-full bg-neutral rounded-full relative"
              style={{ width: `${volume}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-neutral-light rounded-full shadow-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
