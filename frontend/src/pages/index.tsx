import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import AlbumCard from '../components/AlbumCard';
import PlaylistCard from '../components/PlaylistCard';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function Home() {
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState<Playlist[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Fetch data from Firebase
    const fetchData = async () => {
      try {
        // Fetch recent albums
        const albumsQuery = query(collection(db, 'albums'), limit(5));
        const albumsSnapshot = await getDocs(albumsQuery);
        const albumsData = albumsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Album));
        setRecentAlbums(albumsData);
        
        // Fetch recommended playlists
        const recommendedQuery = query(collection(db, 'playlists'), limit(5));
        const recommendedSnapshot = await getDocs(recommendedQuery);
        const recommendedData = recommendedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Playlist));
        setRecommendedPlaylists(recommendedData);
        
        // Fetch featured playlists
        const featuredQuery = query(collection(db, 'playlists'), limit(5));
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Playlist));
        setFeaturedPlaylists(featuredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    // For development, use placeholder data if Firebase data not available
    const usePlaceholderData = () => {
      setRecentAlbums([
        { id: '1', title: 'Dawn Chorus', artist: 'Ambient Waves', imageUrl: '/placeholder-album-1.jpg' },
        { id: '2', title: 'Night Drive', artist: 'The Synthetics', imageUrl: '/placeholder-album-2.jpg' },
        { id: '3', title: 'Urban Echoes', artist: 'City Pulse', imageUrl: '/placeholder-album-3.jpg' },
        { id: '4', title: 'Cosmic Journey', artist: 'Stardust', imageUrl: '/placeholder-album-4.jpg' },
        { id: '5', title: 'Electric Dreams', artist: 'Neon Nights', imageUrl: '/placeholder-album-5.jpg' },
      ]);
      
      setRecommendedPlaylists([
        { id: '1', name: 'Chill Vibes', description: 'Relaxing tunes for your day', imageUrl: '/placeholder-playlist-1.jpg' },
        { id: '2', name: 'Workout Mix', description: 'Energetic beats to keep you moving', imageUrl: '/placeholder-playlist-2.jpg' },
        { id: '3', name: 'Focus Flow', description: 'Concentration-enhancing tracks', imageUrl: '/placeholder-playlist-3.jpg' },
        { id: '4', name: 'Evening Jazz', description: 'Smooth jazz for the evening', imageUrl: '/placeholder-playlist-4.jpg' },
        { id: '5', name: 'Morning Boost', description: 'Start your day right', imageUrl: '/placeholder-playlist-5.jpg' },
      ]);
      
      setFeaturedPlaylists([
        { id: '6', name: 'Summer Hits', description: 'This season\'s top tracks', imageUrl: '/placeholder-playlist-6.jpg' },
        { id: '7', name: 'Throwback Classics', description: 'Nostalgic favorites', imageUrl: '/placeholder-playlist-7.jpg' },
        { id: '8', name: 'Indie Discoveries', description: 'Fresh indie sounds', imageUrl: '/placeholder-playlist-8.jpg' },
        { id: '9', name: 'Electronic Fusion', description: 'Cutting-edge electronic music', imageUrl: '/placeholder-playlist-9.jpg' },
        { id: '10', name: 'Acoustic Sessions', description: 'Stripped-down performances', imageUrl: '/placeholder-playlist-10.jpg' },
      ]);
    };
    
    if (process.env.NODE_ENV === 'development') {
      usePlaceholderData();
    } else {
      fetchData();
    }
  }, []);
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-light mb-6">
          Good evening, {user?.displayName || 'Music Lover'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recently played items */}
          <button 
            className="flex items-center bg-primary-light bg-opacity-60 hover:bg-opacity-80 rounded-md overflow-hidden"
            onClick={() => router.push('/liked-songs')}
          >
            <img src="/liked-songs.jpg" alt="Liked Songs" className="h-20 w-20" />
            <span className="ml-4 font-semibold">Liked Songs</span>
          </button>
          <button 
            className="flex items-center bg-primary-light bg-opacity-60 hover:bg-opacity-80 rounded-md overflow-hidden"
            onClick={() => router.push('/daily-mix')}
          >
            <img src="/daily-mix.jpg" alt="Daily Mix" className="h-20 w-20" />
            <span className="ml-4 font-semibold">Daily Mix 1</span>
          </button>
          <button 
            className="flex items-center bg-primary-light bg-opacity-60 hover:bg-opacity-80 rounded-md overflow-hidden"
            onClick={() => router.push('/discover')}
          >
            <img src="/discover.jpg" alt="Discover Weekly" className="h-20 w-20" />
            <span className="ml-4 font-semibold">Discover Weekly</span>
          </button>
        </div>
      </section>
      
      {/* Made For You Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-light">Made For You</h2>
          <a href="#" className="text-neutral text-sm font-semibold hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendedPlaylists.map(playlist => (
            <PlaylistCard 
              key={playlist.id}
              id={playlist.id}
              title={playlist.name}
              description={playlist.description}
              imageUrl={playlist.imageUrl}
            />
          ))}
        </div>
      </section>
      
      {/* Recently Played Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-light">Recently played</h2>
          <a href="#" className="text-neutral text-sm font-semibold hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recentAlbums.map(album => (
            <AlbumCard 
              key={album.id}
              id={album.id}
              title={album.title}
              artist={album.artist}
              imageUrl={album.imageUrl}
              onClick={() => router.push(`/album/${album.id}`)}
            />
          ))}
        </div>
      </section>
      
      {/* Featured Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-light">Featured playlists</h2>
          <a href="#" className="text-neutral text-sm font-semibold hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {featuredPlaylists.map(playlist => (
            <PlaylistCard 
              key={playlist.id}
              id={playlist.id}
              title={playlist.name}
              description={playlist.description}
              imageUrl={playlist.imageUrl}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}
