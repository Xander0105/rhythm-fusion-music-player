import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { AddTrackData, RemoveTrackData } from './types';

const db = admin.firestore();

export const playlistFunctions = {
  // Add track to playlist
  addTrackToPlaylist: functions.https.onCall(async (data: AddTrackData, context: functions.https.CallableContext) => {
    // Ensure the user is authenticated
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to perform this action'
      );
    }
    
    const { playlistId, trackId } = data;
    if (!playlistId || !trackId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Playlist ID and Track ID are required'
      );
    }
    
    try {
      // Get playlist
      const playlistDoc = await db.collection('playlists').doc(playlistId).get();
      if (!playlistDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Playlist not found'
        );
      }
      
      const playlistData = playlistDoc.data();
      
      // Check if user has permission to modify playlist
      if (playlistData?.createdBy !== context.auth.uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to modify this playlist'
        );
      }
      
      // Get track
      const trackDoc = await db.collection('tracks').doc(trackId).get();
      if (!trackDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Track not found'
        );
      }
      
      // Update playlist
      const tracks = playlistData?.tracks || [];
      if (tracks.includes(trackId)) {
        return { success: true, message: 'Track already in playlist' };
      }
      
      // Add track to playlist
      await db.collection('playlists').doc(playlistId).update({
        tracks: admin.firestore.FieldValue.arrayUnion(trackId),
        songCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update track's playlists array
      await db.collection('tracks').doc(trackId).update({
        playlistIds: admin.firestore.FieldValue.arrayUnion(playlistId)
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to add track to playlist'
      );
    }
  }),
  
  // Remove track from playlist
  removeTrackFromPlaylist: functions.https.onCall(async (data: RemoveTrackData, context: functions.https.CallableContext) => {
    // Ensure the user is authenticated
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to perform this action'
      );
    }
    
    const { playlistId, trackId } = data;
    if (!playlistId || !trackId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Playlist ID and Track ID are required'
      );
    }
    
    try {
      // Get playlist
      const playlistDoc = await db.collection('playlists').doc(playlistId).get();
      if (!playlistDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Playlist not found'
        );
      }
      
      const playlistData = playlistDoc.data();
      
      // Check if user has permission to modify playlist
      if (playlistData?.createdBy !== context.auth.uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to modify this playlist'
        );
      }
      
      // Update playlist
      await db.collection('playlists').doc(playlistId).update({
        tracks: admin.firestore.FieldValue.arrayRemove(trackId),
        songCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update track's playlists array
      await db.collection('tracks').doc(trackId).update({
        playlistIds: admin.firestore.FieldValue.arrayRemove(playlistId)
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to remove track from playlist'
      );
    }
  })
};
