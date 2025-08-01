import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Fix imports to default style
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { authFunctions } from './auth';
import { trackFunctions } from './tracks';
import { playlistFunctions } from './playlists';
import { recommendationFunctions } from './recommendations';
import { searchFunctions } from './search';
import { apiRouter } from './api';

// Set up Express for API routes
const app = express();
app.use(cors({ origin: true }));
app.use('/api', apiRouter);

// Export all functions
export const api = functions.https.onRequest(app);
export const auth = authFunctions;
export const tracks = trackFunctions;
export const playlists = playlistFunctions;
export const recommendations = recommendationFunctions;
export const search = searchFunctions;
