import express from 'express';
import * as admin from 'firebase-admin';
import { AuthRequest } from './types';

const db = admin.firestore();
const router = express.Router();

// Middleware to verify Firebase ID token
const authenticateUser = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Get featured playlists
router.get('/featured-playlists', async (req, res) => {
  try {
    const playlistsSnapshot = await db
      .collection('playlists')
      .where('isPublic', '==', true)
      .limit(10)
      .get();
    
    const playlists = playlistsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ playlists });
  } catch (error) {
    console.error('Error getting featured playlists:', error);
    res.status(500).json({ error: 'Failed to get featured playlists' });
  }
});

// Get new releases
router.get('/new-releases', async (req, res) => {
  try {
    const albumsSnapshot = await db
      .collection('albums')
      .orderBy('releaseDate', 'desc')
      .limit(10)
      .get();
    
    const albums = albumsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ albums });
  } catch (error) {
    console.error('Error getting new releases:', error);
    res.status(500).json({ error: 'Failed to get new releases' });
  }
});

// Get user playlists (requires authentication)
router.get('/user-playlists', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const playlistsSnapshot = await db
      .collection('playlists')
      .where('createdBy', '==', req.user?.uid)
      .get();
    
    const playlists = playlistsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ playlists });
  } catch (error) {
    console.error('Error getting user playlists:', error);
    res.status(500).json({ error: 'Failed to get user playlists' });
  }
});

export { router as apiRouter };
