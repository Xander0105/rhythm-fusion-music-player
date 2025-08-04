import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export default function Profile() {
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setImagePreview(user.photoURL || '');
    }
  }, [user]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Handle development mode differently
      if (process.env.NODE_ENV === 'development') {
        // For development, just store the image preview in localStorage
        let photoURL = user.photoURL || '';
        
        if (imagePreview && imagePreview !== user.photoURL) {
          photoURL = imagePreview;
          
          // Update dev user in localStorage
          const savedUser = localStorage.getItem('dev-user');
          if (savedUser) {
            const devUser = JSON.parse(savedUser);
            devUser.displayName = displayName;
            devUser.photoURL = photoURL;
            localStorage.setItem('dev-user', JSON.stringify(devUser));
            
            // Update the user in AuthContext
            if (user) {
              // This is a hack for development mode
              (user as any).displayName = displayName;
              (user as any).photoURL = photoURL;
            }
          }
        }
        
        setSuccess('Profile updated successfully (Development Mode)');
        setLoading(false);
        return;
      }
      
      // Production mode - use Firebase
      let photoURL = user.photoURL || '';
      
      if (profileImage) {
        const imageRef = ref(storage, `profile-images/${user.uid}/profile-pic-${Date.now()}.jpg`);
        await uploadBytes(imageRef, profileImage);
        photoURL = await getDownloadURL(imageRef);
      }
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName,
        photoURL
      });
      
      // Update Firestore user document if it exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          displayName,
          photoURL
        });
      }
      
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-light mb-4">Sign in to view your profile</h2>
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
        <h1 className="text-3xl font-bold text-neutral-light mb-6">Your Profile</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-primary-light p-6 rounded-lg">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Profile Image Upload */}
            <div className="md:w-1/3">
              <div 
                className="aspect-square bg-primary-dark rounded-full flex items-center justify-center overflow-hidden relative"
                style={{ 
                  backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!imagePreview && (
                  <div className="text-center p-4">
                    <p className="text-neutral mb-2">Upload Profile Image</p>
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
                <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="displayName">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                  placeholder="Your display name"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-primary-dark border border-neutral-dark rounded text-neutral cursor-not-allowed"
                />
                <p className="text-neutral-dark text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary-light text-primary font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-primary rounded border border-neutral-dark">
            <p className="text-neutral text-sm">
              <strong>Development Mode:</strong> Profile updates are stored locally and will not persist after page refresh.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
