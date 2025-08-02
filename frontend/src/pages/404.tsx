import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-6xl font-bold text-secondary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-light mb-6">Page Not Found</h2>
        <p className="text-neutral mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="bg-secondary hover:bg-secondary-light text-primary font-medium py-2 px-6 rounded-full transition-colors">
          Back to Home
        </Link>
      </div>
    </Layout>
  );
}
