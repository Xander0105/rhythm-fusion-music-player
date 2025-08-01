import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { IncrementPlayCountData } from './types';

const db = admin.firestore();

export const trackFunctions = {
  // Process uploaded audio file
  processAudioUpload: functions.storage
    .object()
    .onFinalize(async (object: functions.storage.ObjectMetadata) => {
      // Only process audio files in the tracks directory
      if (!object.name || !object.name.startsWith('tracks/')) {
        return null;
      }
      
      // Only process audio files
      if (!object.contentType || !object.contentType.startsWith('audio/')) {
        return null;
      }
      
      try {
        // Extract user ID from path (tracks/{userId}/{fileName})
        const pathParts = object.name.split('/');
        if (pathParts.length < 3) {
          console.error('Invalid file path:', object.name);
          return null;
        }
        
        const userId = pathParts[1];
        const fileName = pathParts[2];
        
        // Create a document in the tracks collection
        const trackData = {
          title: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension
          artist: 'Unknown Artist', // Default, should be updated by the user
          album: 'Unknown Album',
          duration: 0, // Will be updated after processing
          uploadedBy: userId,
          uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
          audioUrl: `https://storage.googleapis.com/${object.bucket}/${object.name}`,
          coverUrl: '/placeholder-track.jpg',
          playCount: 0,
          likeCount: 0,
          playlistIds: []
        };
        
        const trackRef = await db.collection('tracks').add(trackData);
        
        console.log(`Created track document for ${object.name} with ID ${trackRef.id}`);
        return null;
      } catch (error) {
        console.error('Error processing audio upload:', error);
        return null;
      }
    }),
  
  // Update track play count
  incrementPlayCount: functions.https.onCall(async (data: IncrementPlayCountData, context: functions.https.CallableContext) => {
    // Ensure the user is authenticated
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to perform this action'
      );
    }
    
    const { trackId } = data;
    if (!trackId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Track ID is required'
      );
    }
    
    try {
      // Update track play count
      await db.collection('tracks').doc(trackId).update({
        playCount: admin.firestore.FieldValue.increment(1)
      });
      
      // Record play in user history
      await db.collection('userHistory').add({
        userId: context.auth.uid,
        trackId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error incrementing play count:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to update play count'
      );
    }
  })
};
