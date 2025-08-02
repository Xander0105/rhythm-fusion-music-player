import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import { PlayerProvider } from '../context/PlayerContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Component {...pageProps} />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default MyApp;
