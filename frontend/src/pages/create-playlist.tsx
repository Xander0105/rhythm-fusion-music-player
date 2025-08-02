import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export default function CreatePlaylist() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a playlist');
      return;
    }
    
    if (!name.trim()) {
      setError('Playlist name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Upload cover image if provided
      let imageUrl = '/default-playlist.jpg';
      if (coverImage) {
        const imageRef = ref(storage, `playlist-covers/${user.uid}/${Date.now()}-${coverImage.name}`);
        await uploadBytes(imageRef, coverImage);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      // Create playlist document
      const playlistRef = await addDoc(collection(db, 'playlists'), {
        name,
        description,
        isPublic,
        imageUrl,
        createdBy: user.uid,
        creatorName: user.displayName || 'User',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        songCount: 0,
        duration: '0 min',
        tracks: []
      });
      
      // Redirect to the new playlist
      router.push(`/playlist/${playlistRef.id}`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-light mb-4">Sign in to create playlists</h2>
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-light mb-6">Create Playlist</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-primary-light p-6 rounded-lg">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Cover Image Upload */}
            <div className="md:w-1/3">
              <div 
                className="aspect-square bg-primary-dark rounded-md flex items-center justify-center overflow-hidden relative"
                style={{ 
                  backgroundImage: coverPreview ? `url(${coverPreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!coverPreview && (
                  <div className="text-center p-4">
                    <p className="text-neutral mb-2">Upload Cover Image</p>
                    <p className="text-neutral-dark text-sm">Optional</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="md:w-2/3">
              <div className="mb-4">
                <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                  placeholder="What's this playlist about? (Optional)"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mr-2 h-4 w-4 text-secondary focus:ring-secondary border-neutral-dark rounded"
                  />
                  <span className="text-neutral-light">Make playlist public</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 mr-2 text-neutral-light hover:text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary-light text-primary font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
