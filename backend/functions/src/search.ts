import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { SearchData, Track, Album, Playlist } from './types';

const db = admin.firestore();

export const searchFunctions = {
  // Search tracks, albums, and playlists
  search: functions.https.onCall(async (data: SearchData, context: functions.https.CallableContext) => {
    const { query, limit = 10 } = data;
    
    if (!query || typeof query !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Search query is required'
      );
    }
    
    try {
      // Convert query to lowercase for case-insensitive search
      const queryLower = query.toLowerCase();
      
      // Search tracks
      const tracksSnapshot = await db.collection('tracks').get();
      const tracks = tracksSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'track'
        } as Track & { type: string }))
        .filter(track => 
          track.title.toLowerCase().includes(queryLower) ||
          track.artist.toLowerCase().includes(queryLower) ||
          track.album.toLowerCase().includes(queryLower)
        )
        .slice(0, limit);
      
      // Search albums
      const albumsSnapshot = await db.collection('albums').get();
      const albums = albumsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'album'
        } as Album & { type: string }))
        .filter(album => 
          album.title.toLowerCase().includes(queryLower) ||
          album.artist.toLowerCase().includes(queryLower)
        )
        .slice(0, limit);
      
      // Search public playlists
      const playlistsSnapshot = await db
        .collection('playlists')
        .where('isPublic', '==', true)
        .get();
      
      const playlists = playlistsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'playlist'
        } as Playlist & { type: string }))
        .filter(playlist => 
          playlist.name.toLowerCase().includes(queryLower) ||
          (playlist.description && playlist.description.toLowerCase().includes(queryLower))
        )
        .slice(0, limit);
      
      // If user is authenticated, also search their private playlists
      let userPlaylists: (Playlist & { type: string })[] = [];
      if (context && context.auth) {
        const userPlaylistsSnapshot = await db
          .collection('playlists')
          .where('createdBy', '==', context.auth.uid)
          .where('isPublic', '==', false)
          .get();
        
        userPlaylists = userPlaylistsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'playlist'
          } as Playlist & { type: string }))
          .filter(playlist => 
            playlist.name.toLowerCase().includes(queryLower) ||
            (playlist.description && playlist.description.toLowerCase().includes(queryLower))
          )
          .slice(0, limit);
      }
      
      return {
        tracks,
        albums,
        playlists: [...playlists, ...userPlaylists]
      };
    } catch (error) {
      console.error('Error searching:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to perform search'
      );
    }
  })
};
