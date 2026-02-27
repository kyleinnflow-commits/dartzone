"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-zinc-400 text-center mb-6 max-w-sm">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
