// frontend/src/components/TrackList.tsx

import React, { useState, useEffect } from 'react';
import { ClockIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { usePlayer } from '../context/PlayerContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  plays?: string;
  coverUrl?: string;
  audioUrl: string;
}

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const { playTrack, currentTrack } = usePlayer();
  const { user } = useAuth();
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Load liked tracks on component mount
  useEffect(() => {
    const fetchLikedTracks = async () => {
      if (!user) return;
      
      try {
        // For development mode
        if (process.env.NODE_ENV === 'development') {
          // Check localStorage for liked tracks
          const savedLikes = localStorage.getItem(`liked-tracks-${user.uid}`);
          if (savedLikes) {
            setLikedTracks(JSON.parse(savedLikes));
          }
          return;
        }
        
        // For production
        const userLikesRef = doc(db, 'users', user.uid, 'likes', 'tracks');
        const userLikesDoc = await getDoc(userLikesRef);
        
        if (userLikesDoc.exists()) {
          const likedTrackIds = userLikesDoc.data().trackIds || [];
          const likesMap: Record<string, boolean> = {};
          
          likedTrackIds.forEach((id: string) => {
            likesMap[id] = true;
          });
          
          setLikedTracks(likesMap);
        }
      } catch (error) {
        console.error('Error fetching liked tracks:', error);
      }
    };
    
    fetchLikedTracks();
  }, [user]);
  
  // Toggle like status for a track
  const toggleLike = async (trackId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the row click
    
    if (!user) return;
    
    try {
      const isLiked = likedTracks[trackId];
      
      // For development mode
      if (process.env.NODE_ENV === 'development') {
        const updatedLikes = { ...likedTracks };
        
        if (isLiked) {
          delete updatedLikes[trackId];
        } else {
          updatedLikes[trackId] = true;
        }
        
        // Save to localStorage
        localStorage.setItem(`liked-tracks-${user.uid}`, JSON.stringify(updatedLikes));
        setLikedTracks(updatedLikes);
        return;
      }
      
      // For production
      const userLikesRef = doc(db, 'users', user.uid, 'likes', 'tracks');
      
      if (isLiked) {
        // Unlike track
        await updateDoc(userLikesRef, {
          trackIds: arrayRemove(trackId)
        });
        
        setLikedTracks(prev => ({
          ...prev,
          [trackId]: false
        }));
      } else {
        // Like track
        const userLikesDoc = await getDoc(userLikesRef);
        
        if (userLikesDoc.exists()) {
          await updateDoc(userLikesRef, {
            trackIds: arrayUnion(trackId)
          });
        } else {
          await setDoc(userLikesRef, {
            trackIds: [trackId]
          });
        }
        
        setLikedTracks(prev => ({
          ...prev,
          [trackId]: true
        }));
      }
    } catch (error) {
      console.error('Error updating liked tracks:', error);
    }
  };
  
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-neutral-dark text-neutral text-sm">
        <div className="col-span-1">#</div>
        <div className="col-span-5">TITLE</div>
        <div className="col-span-3">ALBUM</div>
        <div className="col-span-2">PLAYS</div>
        <div className="col-span-1 flex justify-end">
          <ClockIcon className="h-5 w-5" />
        </div>
      </div>
      
      {/* Table Body */}
      {tracks.map((track, index) => (
        <div 
          key={track.id}
          className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-primary-light rounded-md group ${
            currentTrack?.id === track.id ? 'bg-primary-light' : ''
          } cursor-pointer`}
          onClick={() => playTrack(track)}
        >
          <div className="col-span-1 flex items-center text-neutral group-hover:text-neutral-light">
            {index + 1}
          </div>
          <div className="col-span-5 flex items-center">
            <div className="mr-3 h-10 w-10 flex-shrink-0">
              <img 
                src={track.coverUrl || "/placeholder-album.jpg"} 
                alt={track.title} 
                className="h-full w-full object-cover rounded"
              />
            </div>
            <div>
              <p className={`font-medium ${
                currentTrack?.id === track.id ? 'text-secondary' : 'text-neutral-light'
              }`}>{track.title}</p>
              <p className="text-neutral">{track.artist}</p>
            </div>
          </div>
          <div className="col-span-3 flex items-center text-neutral">
            {track.album}
          </div>
          <div className="col-span-2 flex items-center text-neutral">
            {track.plays || '-'}
          </div>
          <div className="col-span-1 flex items-center justify-between text-neutral">
            <button 
              className={`${likedTracks[track.id] ? 'text-secondary' : 'text-neutral opacity-0 group-hover:opacity-100 hover:text-secondary'}`}
              onClick={(e) => toggleLike(track.id, e)}
            >
              {likedTracks[track.id] ? (
                <HeartIconSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>
      ))}
      
      {tracks.length === 0 && (
        <div className="py-8 text-center text-neutral">
          No tracks available
        </div>
      )}
    </div>
  );
};

export default TrackList;
