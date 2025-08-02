import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TrackList from '../components/TrackList';
import { PlayIcon, HeartIcon } from '@heroicons/react/24/solid';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
  audioUrl: string;
}

export default function LikedSongs() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch liked songs IDs
        const likedQuery = query(
          collection(db, 'userLikes'),
          where('userId', '==', user.uid),
          where('type', '==', 'track')
        );
        
        const likedSnapshot = await getDocs(likedQuery);
        const trackIds = likedSnapshot.docs.map(doc => doc.data().itemId);
        
        // Fetch track details
        const tracksData: Track[] = [];
        for (const trackId of trackIds) {
          const trackDoc = await getDocs(query(
            collection(db, 'tracks'),
            where('id', '==', trackId)
          ));
          
          if (!trackDoc.empty) {
            tracksData.push({
              id: trackDoc.docs[0].id,
              ...trackDoc.docs[0].data()
            } as Track);
          }
        }
        
        setTracks(tracksData);
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // For development, use placeholder data
    const usePlaceholderData = () => {
      setTracks([
        { id: '1', title: 'Dreamscape', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 225, audioUrl: '/tracks/dreamscape.mp3' },
        { id: '2', title: 'Midnight Serenade', artist: 'Luna Echo', album: 'Nocturnal Whispers', duration: 252, audioUrl: '/tracks/midnight-serenade.mp3' },
        { id: '3', title: 'Golden Horizon', artist: 'Solar Flare', album: 'Dawn Breaker', duration: 208, audioUrl: '/tracks/golden-horizon.mp3' },
        { id: '4', title: 'Crystal Caves', artist: 'Mystic Voyager', album: 'Inner Realms', duration: 307, audioUrl: '/tracks/crystal-caves.mp3' },
        { id: '5', title: 'Neon Dreams', artist: 'Urban Pulse', album: 'City Lights', duration: 236, audioUrl: '/tracks/neon-dreams.mp3' },
      ]);
      
      setLoading(false);
    };
    
    if (process.env.NODE_ENV === 'development') {
      usePlaceholderData();
    } else {
      fetchLikedSongs();
    }
  }, [user]);
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-light mb-4">Sign in to see your liked songs</h2>
          <button 
            onClick={() => router.push('/login')}
            className="bg-secondary text-primary font-medium py-2 px-6 rounded-full hover:bg-secondary-light"
          >
            Sign In
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-6 mb-8">
        <div className="h-60 w-60 bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-2xl">
          <HeartIcon className="h-32 w-32 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase text-neutral-light">PLAYLIST</p>
          <h1 className="text-4xl md:text-7xl font-bold text-neutral-light mt-2 mb-4">Liked Songs</h1>
          <div className="flex items-center text-neutral">
            <span className="font-semibold text-neutral-light">{user.displayName || 'User'}</span>
            <span className="mx-1">•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-4 mb-8">
        <button className="bg-secondary hover:bg-secondary-light text-primary rounded-full p-3 flex items-center justify-center shadow-lg">
          <PlayIcon className="h-8 w-8" />
        </button>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      )}
      
      {/* Songs Table */}
      {!loading && (
        <>
          {tracks.length > 0 ? (
            <div className="mb-10">
              <TrackList tracks={tracks} />
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-neutral-light mb-2">No liked songs yet</h3>
              <p className="text-neutral mb-4">Save songs by clicking the heart icon</p>
              <button 
                onClick={() => router.push('/search')}
                className="bg-secondary text-primary font-medium py-2 px-6 rounded-full hover:bg-secondary-light"
              >
                Discover Music
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
