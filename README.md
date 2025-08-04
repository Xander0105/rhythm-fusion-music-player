# Rhythm Fusion Music Player

## Project Overview
Rhythm Fusion is a modern web-based music player application that allows users to play music, create playlists, and enjoy a seamless music listening experience. The application features a sleek black and gold design theme and provides all essential music player functionality.

## Features
- **User Authentication**: Sign up, login, and profile management
- **Audio Playback**: Play, pause, and seek through songs
- **Volume Control**: Adjust volume with an interactive slider
- **Playlist Management**: Create, view, and edit playlists
- **Song Information**: Display title, artist, and album information
- **Responsive Design**: Works on various screen sizes
- **Sample Tracks**: Pre-loaded tracks for demonstration
- **User Library**: Save favorite songs and albums

## How to Use
1. **Sign Up/Login**: Create an account or log in to access personalized features
2. **Browse Music**: Navigate through the home page to discover music
3. **Play Music**: Click on any track to start playing
4. **Control Playback**: Use the player controls at the bottom to play/pause, skip tracks, and adjust volume
5. **Create Playlists**: Click "Create Playlist" in the sidebar to make a new playlist
6. **Add to Playlist**: Click the "+" icon on any track to add it to a playlist
7. **Profile Management**: Click on your profile picture to update your information

## Technologies Used
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **State Management**: React Context API
- **Styling**: Custom Tailwind CSS with black and gold theme
- **Audio Processing**: HTML5 Audio API

## Setup Instructions
1. **Prerequisites**:
   - Node.js (v14 or later)
   - npm or yarn
   - Firebase account (for deployment)

2. **Local Development**:
   ```bash
   # Clone the repository
   git clone https://github.com/Xander0105/rhythm-fusion-music-player.git
   cd rhythm-fusion-music-player

   # Install frontend dependencies
   cd frontend
   npm install

   # Run frontend development server
   npm run dev

   # In a separate terminal, start the backend emulators
   cd ../backend
   npm install
   npm run emulators


