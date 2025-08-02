import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AlbumCard from '../components/AlbumCard';
import PlaylistCard from '../components/PlaylistCard';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

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

export default function Library() {
  const [activeTab, setActiveTab] = useState('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch user playlists
        const playlistsQuery = query(
          collection(db, 'playlists'),
          where('createdBy', '==', user.uid)
        );
        
        const playlistsSnapshot = await getDocs(playlistsQuery);
        const playlistsData = playlistsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Playlist));
        
        setPlaylists(playlistsData);
        
        // Fetch saved albums
        const savedAlbumsQuery = query(
          collection(db, 'userLibrary'),
          where('userId', '==', user.uid),
          where('type', '==', 'album')
        );
        
        const savedAlbumsSnapshot = await getDocs(savedAlbumsQuery);
        const albumIds = savedAlbumsSnapshot.docs.map(doc => doc.data().itemId);
        
        // Fetch album details
        const albumsData: Album[] = [];
        for (const albumId of albumIds) {
          const albumDoc = await getDocs(query(
            collection(db, 'albums'),
            where('id', '==', albumId)
          ));
          
          if (!albumDoc.empty) {
            albumsData.push({
              id: albumDoc.docs[0].id,
              ...albumDoc.docs[0].data()
            } as Album);
          }
        }
        
        setAlbums(albumsData);
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // For development, use placeholder data
    const usePlaceholderData = () => {
      setPlaylists([
        { id: '1', name: 'My Playlist #1', description: 'Created by you', imageUrl: '/playlist-1.jpg' },
        { id: '2', name: 'Coding Mix', description: 'Perfect for coding sessions', imageUrl: '/playlist-2.jpg' },
        { id: '3', name: 'Workout Beats', description: 'High energy tracks', imageUrl: '/playlist-3.jpg' },
      ]);
      
      setAlbums([
        { id: '1', title: 'Ethereal Journey', artist: 'Cosmic Harmony', imageUrl: '/album-1.jpg' },
        { id: '2', title: 'Nocturnal Whispers', artist: 'Luna Echo', imageUrl: '/album-2.jpg' },
        { id: '3', title: 'Dawn Breaker', artist: 'Solar Flare', imageUrl: '/album-3.jpg' },
        { id: '4', title: 'Inner Realms', artist: 'Mystic Voyager', imageUrl: '/album-4.jpg' },
      ]);
      
      setLoading(false);
    };
    
    if (process.env.NODE_ENV === 'development') {
      usePlaceholderData();
    } else {
      fetchLibrary();
    }
  }, [user]);
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-light mb-4">Sign in to view your library</h2>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-light mb-6">Your Library</h1>
        
        {/* Tabs */}
        <div className="border-b border-neutral-dark mb-6">
          <div className="flex space-x-6">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'playlists' ? 'text-neutral-light border-b-2 border-secondary' : 'text-neutral hover:text-neutral-light'}`}
              onClick={() => setActiveTab('playlists')}
            >
              Playlists
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'albums' ? 'text-neutral-light border-b-2 border-secondary' : 'text-neutral hover:text-neutral-light'}`}
              onClick={() => setActiveTab('albums')}
            >
              Albums
            </button>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        )}
        
        {/* Library Content */}
        {!loading && (
          <>
            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <>
                {playlists.length > 0 ? (
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
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-neutral-light mb-2">You don't have any playlists yet</h3>
                    <p className="text-neutral mb-4">Create your first playlist</p>
                    <button 
                      onClick={() => router.push('/create-playlist')}
                      className="bg-secondary text-primary font-medium py-2 px-6 rounded-full hover:bg-secondary-light"
                    >
                      Create Playlist
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Albums Tab */}
            {activeTab === 'albums' && (
              <>
                {albums.length > 0 ? (
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
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-neutral-light mb-2">No saved albums yet</h3>
                    <p className="text-neutral mb-4">Save albums by clicking the heart icon</p>
                    <button 
                      onClick={() => router.push('/search')}
                      className="bg-secondary text-primary font-medium py-2 px-6 rounded-full hover:bg-secondary-light"
                    >
                      Browse Albums
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
