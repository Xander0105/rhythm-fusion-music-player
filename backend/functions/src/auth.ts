import * as functions from 'firebase-functions/v1'; // Use v1 explicitly
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const authFunctions = {
  // Create user document when new user signs up
  createUserDocument: functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
    try {
      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: 'user'
      });
      
      // Create default "Liked Songs" playlist
      await db.collection('playlists').add({
        name: 'Liked Songs',
        description: 'Your liked songs',
        createdBy: user.uid,
        creatorName: user.displayName || 'User',
        isPublic: false,
        imageUrl: '/liked-songs.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        songCount: 0,
        duration: '0 min',
        tracks: []
      });
      
      console.log(`Created user document for ${user.uid}`);
      return null;
    } catch (error) {
      console.error('Error creating user document:', error);
      return null;
    }
  }),
  
  // Clean up user data when user is deleted
  cleanupUserData: functions.auth.user().onDelete(async (user: admin.auth.UserRecord) => {
    try {
      // Delete user document
      await db.collection('users').doc(user.uid).delete();
      
      // Delete user playlists
      const playlistsSnapshot = await db
        .collection('playlists')
        .where('createdBy', '==', user.uid)
        .get();
      
      const batch = db.batch();
      playlistsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete user likes
      const likesSnapshot = await db
        .collection('userLikes')
        .where('userId', '==', user.uid)
        .get();
      
      likesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete user library entries
      const librarySnapshot = await db
        .collection('userLibrary')
        .where('userId', '==', user.uid)
        .get();
      
      librarySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`Cleaned up data for user ${user.uid}`);
      return null;
    } catch (error) {
      console.error('Error cleaning up user data:', error);
      return null;
    }
  })
};
