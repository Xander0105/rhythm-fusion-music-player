// frontend/src/components/Sidebar.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon, 
  PlusCircleIcon, 
  HeartIcon,
  MusicalNoteIcon 
} from '@heroicons/react/24/outline';

interface Playlist {
  id: string;
  name: string;
  isPublic?: boolean; // Make this optional
}

const Sidebar: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch user playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user) return;

      try {
        // For development mode, use placeholder data
        if (process.env.NODE_ENV === 'development') {
          setPlaylists([
            { id: '1', name: 'My Playlist #1' },
            { id: '2', name: 'Coding Mix' },
            { id: '3', name: 'Workout Beats' },
          ]);
          return;
        }

        // For production, fetch from Firebase
        const q = query(
          collection(db, 'playlists'),
          where('createdBy', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const playlistsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          isPublic: doc.data().isPublic
        }));
        
        setPlaylists(playlistsData);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [user]);

  return (
    <div className="w-64 flex-shrink-0 bg-primary-dark flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-neutral-light">Rhythm</span>
          <span className="text-secondary">Fusion</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="px-2 mt-2">
        <Link href="/" className={`flex items-center px-4 py-2 text-neutral-light hover:bg-primary-light rounded-md group ${
          router.pathname === '/' ? 'bg-primary-light' : ''
        }`}>
          <HomeIcon className={`h-6 w-6 mr-4 ${
            router.pathname === '/' ? 'text-secondary' : 'text-neutral group-hover:text-secondary'
          }`} />
          Home
        </Link>
        
        <Link href="/search" className={`flex items-center px-4 py-2 text-neutral-light hover:bg-primary-light rounded-md group ${
          router.pathname === '/search' ? 'bg-primary-light' : ''
        }`}>
          <MagnifyingGlassIcon className={`h-6 w-6 mr-4 ${
            router.pathname === '/search' ? 'text-secondary' : 'text-neutral group-hover:text-secondary'
          }`} />
          Search
        </Link>
        
        <Link href="/library" className={`flex items-center px-4 py-2 text-neutral-light hover:bg-primary-light rounded-md group ${
          router.pathname === '/library' ? 'bg-primary-light' : ''
        }`}>
          <BookOpenIcon className={`h-6 w-6 mr-4 ${
            router.pathname === '/library' ? 'text-secondary' : 'text-neutral group-hover:text-secondary'
          }`} />
          Your Library
        </Link>

        <Link href="/sample-tracks" className={`flex items-center px-4 py-2 text-neutral-light hover:bg-primary-light rounded-md group ${
          router.pathname === '/sample-tracks' ? 'bg-primary-light' : ''
        }`}>
          <MusicalNoteIcon className={`h-6 w-6 mr-4 ${
            router.pathname === '/sample-tracks' ? 'text-secondary' : 'text-neutral group-hover:text-secondary'
          }`} />
          Sample Tracks
        </Link>
        
        <div className="mt-8">
          <Link href="/create-playlist" className="flex items-center px-4 py-2 text-neutral-light hover:bg-primary-light rounded-md group">
            <PlusCircleIcon className="h-6 w-6 mr-4 text-neutral group-hover:text-secondary" />
            Create Playlist
          </Link>
          
          <Link href="/liked-songs" className={`flex items-center px-4 py-2 text-neutral-light hover:bg-primary-light rounded-md group ${
            router.pathname === '/liked-songs' ? 'bg-primary-light' : ''
          }`}>
            <HeartIcon className={`h-6 w-6 mr-4 ${
              router.pathname === '/liked-songs' ? 'text-secondary' : 'text-neutral group-hover:text-secondary'
            }`} />
            Liked Songs
          </Link>
        </div>
      </nav>
      
      {/* Divider */}
      <div className="mx-6 my-4 border-t border-neutral-dark"></div>
      
      {/* Playlists */}
      <div className="px-6 overflow-y-auto flex-1">
        <h2 className="text-sm font-semibold text-neutral mb-2">PLAYLISTS</h2>
        <ul>
          {playlists.map(playlist => (
            <li key={playlist.id} className="py-1.5">
              <Link href={`/playlist/${playlist.id}`} className={`text-neutral hover:text-neutral-light ${
                router.asPath === `/playlist/${playlist.id}` ? 'text-neutral-light' : ''
              }`}>
                {playlist.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-neutral-dark">
          <Link href="/profile" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0)
              )}
            </div>
            <span className="ml-2 text-neutral-light">
              {user.displayName || user.email?.split('@')[0]}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
