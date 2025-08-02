import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <header className="bg-primary-light bg-opacity-95 sticky top-0 z-10 flex items-center justify-between px-8 py-4">
      {/* Navigation Controls */}
      <div className="flex items-center">
        <button 
          className="rounded-full bg-black p-1 mr-2"
          onClick={() => router.back()}
        >
          <ChevronLeftIcon className="h-6 w-6 text-neutral" />
        </button>
        <button 
          className="rounded-full bg-black p-1"
          onClick={() => router.forward()}
        >
          <ChevronRightIcon className="h-6 w-6 text-neutral" />
        </button>
        
        {/* Search Bar - Only show on non-search pages */}
        {!router.pathname.includes('/search') && (
          <form onSubmit={handleSearch} className="relative ml-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-neutral" />
            </div>
            <input
              type="text"
              className="bg-primary-dark text-neutral-light py-2 pl-10 pr-4 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Search for songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}
      </div>
      
      {/* User Menu */}
      {user ? (
        <div className="relative">
          <button 
            className="flex items-center bg-black bg-opacity-70 rounded-full py-1 px-3 hover:bg-opacity-100"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <UserCircleIcon className="h-6 w-6 text-neutral-light" />
            <span className="ml-2 text-neutral-light font-medium">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <ChevronDownIcon className="h-4 w-4 ml-1 text-neutral" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-primary-light ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <a 
                  href="/profile" 
                  className="block px-4 py-2 text-sm text-neutral-light hover:bg-primary hover:text-secondary"
                >
                  Profile
                </a>
                <a 
                  href="/settings" 
                  className="block px-4 py-2 text-sm text-neutral-light hover:bg-primary hover:text-secondary"
                >
                  Settings
                </a>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-light hover:bg-primary hover:text-secondary"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <a 
            href="/login" 
            className="py-2 px-4 mr-2 text-neutral-light hover:text-secondary"
          >
            Log in
          </a>
          <a 
            href="/signup" 
            className="py-2 px-4 bg-secondary text-primary font-medium rounded-full hover:bg-secondary-light"
          >
            Sign up
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;