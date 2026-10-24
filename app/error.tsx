'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 font-bold text-sm">
        Extraction Error
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-xs text-zinc-400 max-w-md">
        An unhandled error occurred while accessing WebPicks. Please try again or return to the dashboard.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition border border-white/10"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
