import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import TrackList from '../../components/TrackList';
import { 
  PlayIcon, 
  HeartIcon, 
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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

interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdBy: string;
  creatorName: string;
  songCount: number;
  duration: string;
}

export default function PlaylistDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!id) return;
      
      try {
        // Fetch playlist details
        const playlistDoc = await getDoc(doc(db, 'playlists', id as string));
        
        if (playlistDoc.exists()) {
          setPlaylist({
            id: playlistDoc.id,
            ...playlistDoc.data()
          } as Playlist);
          
          // Fetch tracks in this playlist
          const tracksQuery = query(
            collection(db, 'tracks'),
            where('playlistIds', 'array-contains', id)
          );
          
          const tracksSnapshot = await getDocs(tracksQuery);
          const tracksData = tracksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Track));
          
          setTracks(tracksData);
        } else {
          console.error('Playlist not found');
          // Redirect to home or show error
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // For development, use placeholder data
    const usePlaceholderData = () => {
      setPlaylist({
        id: id as string,
        name: 'Chill Vibes',
        description: 'Perfect playlist for relaxing',
        imageUrl: '/playlist-cover.jpg',
        createdBy: 'user123',
        creatorName: 'Praful Singh',
        songCount: 5,
        duration: '20 min'
      });
      
      setTracks([
        { id: '1', title: 'Dreamscape', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 225, plays: '1.2M', audioUrl: '/tracks/dreamscape.mp3' },
        { id: '2', title: 'Midnight Serenade', artist: 'Luna Echo', album: 'Nocturnal Whispers', duration: 252, plays: '956K', audioUrl: '/tracks/midnight-serenade.mp3' },
        { id: '3', title: 'Golden Horizon', artist: 'Solar Flare', album: 'Dawn Breaker', duration: 208, plays: '2.5M', audioUrl: '/tracks/golden-horizon.mp3' },
        { id: '4', title: 'Crystal Caves', artist: 'Mystic Voyager', album: 'Inner Realms', duration: 307, plays: '780K', audioUrl: '/tracks/crystal-caves.mp3' },
        { id: '5', title: 'Neon Dreams', artist: 'Urban Pulse', album: 'City Lights', duration: 236, plays: '1.8M', audioUrl: '/tracks/neon-dreams.mp3' },
      ]);
      
      setLoading(false);
    };
    
    if (process.env.NODE_ENV === 'development') {
      usePlaceholderData();
    } else {
      fetchPlaylistData();
    }
  }, [id, router]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {playlist && (
        <>
          {/* Playlist Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-6 mb-8">
            <img 
              src={playlist.imageUrl || "/playlist-cover.jpg"} 
              alt={playlist.name} 
              className="h-60 w-60 shadow-2xl"
            />
            <div>
              <p className="text-sm font-semibold uppercase text-neutral-light">PLAYLIST</p>
              <h1 className="text-4xl md:text-7xl font-bold text-neutral-light mt-2 mb-6">{playlist.name}</h1>
              <div className="flex items-center text-neutral">
                <span className="font-semibold text-neutral-light">{playlist.creatorName}</span>
                <span className="mx-1">•</span>
                <span>{playlist.songCount} songs, {playlist.duration}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mb-8">
            <button className="bg-secondary hover:bg-secondary-light text-primary rounded-full p-3 flex items-center justify-center shadow-lg">
              <PlayIcon className="h-8 w-8" />
            </button>
            <button className="text-neutral hover:text-secondary">
              <HeartIcon className="h-8 w-8" />
            </button>
            <button className="text-neutral hover:text-neutral-light">
              <EllipsisHorizontalIcon className="h-8 w-8" />
            </button>
          </div>
          
          {/* Songs Table */}
          <div className="mb-10">
            <TrackList tracks={tracks} />
          </div>
          
          {/* Additional Info */}
          <div className="text-neutral mb-8">
            <h3 className="text-neutral-light text-lg font-medium mb-2">About</h3>
            <p>{playlist.description || 'No description available'}</p>
          </div>
        </>
      )}
    </Layout>
  );
}
