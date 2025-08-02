import React from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { usePlayer } from '../context/PlayerContext';
import { useRouter } from 'next/router';

interface AlbumCardProps {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  onClick?: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ id, title, artist, imageUrl, onClick }) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/album/${id}`);
    }
  };

  return (
    <div 
      className="bg-primary-light p-4 rounded-md hover:bg-opacity-80 transition-all cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative mb-4">
        <img 
          src={imageUrl || "/placeholder-album.jpg"} 
          alt={title} 
          className="w-full aspect-square object-cover rounded shadow-lg"
        />
        <button 
          className="absolute right-2 bottom-2 bg-secondary rounded-full p-2 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            // This would typically trigger playing the first track of the album
            // For now, we'll just navigate to the album page
            router.push(`/album/${id}`);
          }}
        >
          <PlayIcon className="h-6 w-6 text-primary" />
        </button>
      </div>
      <h3 className="text-neutral-light font-semibold truncate">{title}</h3>
      <p className="text-neutral text-sm truncate">{artist}</p>
    </div>
  );
};

export default AlbumCard;
