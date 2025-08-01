import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const recommendationFunctions = {
  // Generate personalized recommendations based on user's listening history
  generateRecommendations: functions.https.onCall(async (data, context: functions.https.CallableContext) => {
    // Ensure the user is authenticated
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to get recommendations'
      );
    }
    
    try {
      // Get user's listening history
      const historySnapshot = await db
        .collection('userHistory')
        .where('userId', '==', context.auth.uid)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      // Extract track IDs from history
      const trackIds = historySnapshot.docs.map(doc => doc.data().trackId);
      
      // Get user's liked tracks
      const likedSnapshot = await db
        .collection('userLikes')
        .where('userId', '==', context.auth.uid)
        .where('type', '==', 'track')
        .get();
      
      const likedTrackIds = likedSnapshot.docs.map(doc => doc.data().itemId);
      
      // Combine and deduplicate track IDs
      const userTrackIds = Array.from(new Set([...trackIds, ...likedTrackIds]));
      
      // In a real app, you would use a recommendation algorithm here
      // For this example, we'll just fetch some random tracks that the user hasn't heard
      
      // Get all tracks
      const tracksSnapshot = await db
        .collection('tracks')
        .limit(20)
        .get();
      
      const allTracks = tracksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out tracks the user has already heard
      const recommendedTracks = allTracks.filter(
        track => !userTrackIds.includes(track.id)
      );
      
      return {
        recommendations: recommendedTracks.slice(0, 10)
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate recommendations'
      );
    }
  }),
  
  // Generate daily mix playlists - using pubsub topic instead of schedule
  generateDailyMix: functions.pubsub
    .topic('daily-mix-generation')
    .onPublish(async () => {
      try {
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        
        // For each user, generate daily mix
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          
          // Get user's listening history
          const historySnapshot = await db
            .collection('userHistory')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
          
          if (historySnapshot.empty) {
            continue; // Skip users with no listening history
          }
          
          // Extract track IDs from history
          const trackIds = historySnapshot.docs.map(doc => doc.data().trackId);
          
          // Get tracks
          const tracks = [];
          for (const trackId of trackIds.slice(0, 20)) {
            const trackDoc = await db.collection('tracks').doc(trackId).get();
            if (trackDoc.exists) {
              tracks.push({
                id: trackDoc.id,
                ...trackDoc.data()
              });
            }
          }
          
          // Create daily mix playlist
          await db.collection('playlists').add({
            name: `Daily Mix ${new Date().toLocaleDateString()}`,
            description: 'Auto-generated based on your listening history',
            createdBy: userId,
            creatorName: userDoc.data().displayName || 'User',
            isPublic: false,
            imageUrl: '/daily-mix.jpg',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            songCount: tracks.length,
            duration: '30 min', // Approximate
            tracks: tracks.map(track => track.id)
          });
        }
        
        return null;
      } catch (error) {
        console.error('Error generating daily mixes:', error);
        return null;
      }
    })
};
