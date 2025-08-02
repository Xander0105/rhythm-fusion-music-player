import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AlbumCard from '../components/AlbumCard';
import PlaylistCard from '../components/PlaylistCard';
import TrackList from '../components/TrackList';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  
  const [searchQuery, setSearchQuery] = useState(q as string || '');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Update URL without reloading the page
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`, undefined, { shallow: true });
    
    setLoading(true);
    
    try {
      // In a real app, you would search Firestore here
      // For development, use placeholder data
      setTracks([
        { id: '1', title: 'Dreamscape', artist: 'Cosmic Harmony', album: 'Ethereal Journey', duration: 225, audioUrl: '/tracks/dreamscape.mp3' },
        { id: '2', title: 'Midnight Serenade', artist: 'Luna Echo', album: 'Nocturnal Whispers', duration: 252, audioUrl: '/tracks/midnight-serenade.mp3' },
        { id: '3', title: 'Golden Horizon', artist: 'Solar Flare', album: 'Dawn Breaker', duration: 208, audioUrl: '/tracks/golden-horizon.mp3' },
      ]);
      
      setAlbums([
        { id: '1', title: 'Ethereal Journey', artist: 'Cosmic Harmony', imageUrl: '/album-1.jpg' },
        { id: '2', title: 'Nocturnal Whispers', artist: 'Luna Echo', imageUrl: '/album-2.jpg' },
      ]);
      
      setPlaylists([
        { id: '1', name: 'Chill Vibes', description: 'Relaxing tunes for your day', imageUrl: '/playlist-1.jpg' },
        { id: '2', name: 'Night Drive', description: 'Perfect for late night drives', imageUrl: '/playlist-2.jpg' },
      ]);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Run search when query param changes
  useEffect(() => {
    if (q) {
      setSearchQuery(q as string);
      handleSearch();
    }
  }, [q]);
  
  return (
    <Layout>
      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative max-w-3xl">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <MagnifyingGlassIcon className="h-6 w-6 text-neutral" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-primary-light text-neutral-light py-4 pl-14 pr-4 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-secondary text-xl"
            placeholder="Search for songs, artists, albums..."
          />
        </form>
      </div>
      
      {/* Tabs */}
      {(tracks.length > 0 || albums.length > 0 || playlists.length > 0) && (
        <div className="mb-8 border-b border-neutral-dark">
          <div className="flex space-x-6">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-neutral-light border-b-2 border-secondary' : 'text-neutral hover:text-neutral-light'}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'songs' ? 'text-neutral-light border-b-2 border-secondary' : 'text-neutral hover:text-neutral-light'}`}
              onClick={() => setActiveTab('songs')}
            >
              Songs
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'albums' ? 'text-neutral-light border-b-2 border-secondary' : 'text-neutral hover:text-neutral-light'}`}
              onClick={() => setActiveTab('albums')}
            >
              Albums
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'playlists' ? 'text-neutral-light border-b-2 border-secondary' : 'text-neutral hover:text-neutral-light'}`}
              onClick={() => setActiveTab('playlists')}
            >
              Playlists
            </button>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      )}
      
      {/* Search Results */}
      {!loading && (
        <>
          {/* No Results */}
          {tracks.length === 0 && albums.length === 0 && playlists.length === 0 && q && (
            <div className="text-center my-12">
              <h2 className="text-2xl font-bold text-neutral-light mb-2">No results found for "{q}"</h2>
              <p className="text-neutral">Try searching for something else</p>
            </div>
          )}
          
          {/* Display Results based on active tab */}
          {(activeTab === 'all' || activeTab === 'songs') && tracks.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-light mb-4">Songs</h2>
              <TrackList tracks={tracks} />
            </section>
          )}
          
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-light mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albums.map(album => (
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
          )}
          
          {(activeTab === 'all' || activeTab === 'playlists') && playlists.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-light mb-4">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {playlists.map(playlist => (
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
          )}
        </>
      )}
    </Layout>
  );
}
