// Create a new file: frontend/src/pages/sample-tracks.tsx

import React from 'react';
import Layout from '../components/Layout';
import TrackList from '../components/TrackList';
import { sampleTracks } from '../data/sampleTracks';
import { usePlayer } from '../context/PlayerContext';

export default function SampleTracks() {
  const { playTrack } = usePlayer();
  
  const handlePlayAll = () => {
    if (sampleTracks.length > 0) {
      playTrack(sampleTracks[0]);
    }
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-neutral-light">Sample Tracks</h1>
          <button 
            onClick={handlePlayAll}
            className="bg-secondary hover:bg-secondary-light text-primary font-medium py-2 px-6 rounded-full"
          >
            Play All
          </button>
        </div>
        
        <p className="text-neutral mb-6">
          These are sample tracks from Tribe of Noise for demonstration purposes.
        </p>
        
        <TrackList tracks={sampleTracks} />
      </div>
    </Layout>
  );
}
