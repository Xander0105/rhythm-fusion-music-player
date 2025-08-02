import React from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { usePlayer } from '../context/PlayerContext';

interface PlaylistCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ id, title, description, imageUrl }) => {
  const router = useRouter();
  const { playTrack } = usePlayer();
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // In a real implementation, you would:
    // 1. Fetch the first track of the playlist
    // 2. Play it using the playTrack function
    // For now, we'll just navigate to the playlist page
    router.push(`/playlist/${id}`);
  };

  return (
    <div 
      className="bg-primary-light p-4 rounded-md hover:bg-opacity-80 transition-all cursor-pointer group"
      onClick={() => router.push(`/playlist/${id}`)}
    >
      <div className="relative mb-4">
        <img 
          src={imageUrl || "/placeholder-playlist.jpg"} 
          alt={title} 
          className="w-full aspect-square object-cover rounded shadow-lg"
        />
        <button 
          className="absolute right-2 bottom-2 bg-secondary rounded-full p-2 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-lg"
          onClick={handlePlayClick}
        >
          <PlayIcon className="h-6 w-6 text-primary" />
        </button>
      </div>
      <h3 className="text-neutral-light font-semibold truncate">{title}</h3>
      <p className="text-neutral text-sm truncate">{description}</p>
    </div>
  );
};

export default PlaylistCard;
