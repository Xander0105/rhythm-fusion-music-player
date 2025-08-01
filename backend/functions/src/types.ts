// src/types.ts
import * as express from 'express';
import * as admin from 'firebase-admin';
// Remove the unused import:
// import * as functions from 'firebase-functions';

// Request with auth user
export interface AuthRequest extends express.Request {
  user?: admin.auth.DecodedIdToken;
}

// Data models
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uploadedBy: string;
  audioUrl: string;
  coverUrl?: string;
  playCount: number;
  likeCount: number;
  playlistIds?: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  releaseDate: string;
  trackCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  creatorName: string;
  isPublic: boolean;
  imageUrl: string;
  songCount: number;
  duration: string;
  tracks: string[];
}

// Function data types
export interface AddTrackData {
  playlistId: string;
  trackId: string;
}

export interface RemoveTrackData {
  playlistId: string;
  trackId: string;
}

export interface SearchData {
  query: string;
  limit?: number;
}

export interface IncrementPlayCountData {
  trackId: string;
}
