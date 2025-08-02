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
  coverUrl?: string;
  audioUrl: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  releaseDate: string;
  trackCount: number;
  duration: string;
}

export default function AlbumDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!id) return;
      
      try {
        // Fetch album details
        const albumDoc = await getDoc(doc(db, 'albums', id as string));
        
        if (albumDoc.exists()) {
          setAlbum({
            id: albumDoc.id,
            ...albumDoc.data()
          } as Album);
          
          // Fetch tracks in this album
          const tracksQuery = query(
            collection(db, 'tracks'),
            where('albumId', '==', id)
          );
          
          const tracksSnapshot = await getDocs(tracksQuery);
          const tracksData = tracksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Track));
          
          setTracks(tracksData);
        } else {
          console.error('Album not found');
          // Redirect to home or show error
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching album:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // For development, use placeholder data
    const usePlaceholderData = () => {
      setAlbum({
        id: id as string,
        title: 'Ethereal Journey',
        artist: 'Cosmic Harmony',
        imageUrl: '/album-cover.jpg',
        releaseDate: '2025',
        trackCount: 5,
        duration: '18 min'
      });
      
      setTracks([
        { id: '1', title: 'Dreamscape', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 225, audioUrl: '/tracks/dreamscape.mp3' },
        { id: '2', title: 'Astral Waves', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 198, audioUrl: '/tracks/astral-waves.mp3' },
        { id: '3', title: 'Celestial Harmony', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 217, audioUrl: '/tracks/celestial-harmony.mp3' },
        { id: '4', title: 'Nebula Dance', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 245, audioUrl: '/tracks/nebula-dance.mp3' },
        { id: '5', title: 'Cosmic Lullaby', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 192, audioUrl: '/tracks/cosmic-lullaby.mp3' },
      ]);
      
      setLoading(false);
    };
    
    if (process.env.NODE_ENV === 'development') {
      usePlaceholderData();
    } else {
      fetchAlbumData();
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
      {album && (
        <>
          {/* Album Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-6 mb-8">
            <img 
              src={album.imageUrl || "/album-cover.jpg"} 
              alt={album.title} 
              className="h-60 w-60 shadow-2xl"
            />
            <div>
              <p className="text-sm font-semibold uppercase text-neutral-light">ALBUM</p>
              <h1 className="text-4xl md:text-7xl font-bold text-neutral-light mt-2 mb-4">{album.title}</h1>
              <div className="flex items-center text-neutral">
                <span className="font-semibold text-neutral-light">{album.artist}</span>
                <span className="mx-1">•</span>
                <span>{album.releaseDate}</span>
                <span className="mx-1">•</span>
                <span>{album.trackCount} songs, {album.duration}</span>
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
            <h3 className="text-neutral-light text-lg font-medium mb-2">Album Info</h3>
            <p>Released: {album.releaseDate}</p>
            <p>Genre: Electronic, Ambient</p>
            <p>Label: Cosmic Records</p>
          </div>
        </>
      )}
    </Layout>
  );
}
