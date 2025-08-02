import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword, 
  deleteUser 
} from 'firebase/auth';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.email) {
      setPasswordError('You must be logged in');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setPasswordSuccess('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.email) {
      setDeleteError('You must be logged in');
      return;
    }
    
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user
      await deleteUser(user);
      
      // Redirect to home page
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      if (error.code === 'auth/wrong-password') {
        setDeleteError('Current password is incorrect');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-light mb-4">Sign in to access settings</h2>
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
        <h1 className="text-3xl font-bold text-neutral-light mb-6">Settings</h1>
        
        {/* Change Password Section */}
        <section className="bg-primary-light p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-neutral-light mb-4">Change Password</h2>
          
          {passwordError && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
              {passwordSuccess}
            </div>
          )}
          
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-secondary hover:bg-secondary-light text-primary font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>
        
        {/* Delete Account Section */}
        <section className="bg-primary-light p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Delete Account</h2>
          
          <p className="text-neutral mb-4">
            This action is permanent and cannot be undone. All your data will be permanently deleted.
          </p>
          
          {deleteError && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {deleteError}
            </div>
          )}
          
          <form onSubmit={handleDeleteAccount}>
            <div className="mb-4">
              <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="deletePassword">
                Current Password
              </label>
              <input
                id="deletePassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="deleteConfirmation">
                Type DELETE to confirm
              </label>
              <input
                id="deleteConfirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
