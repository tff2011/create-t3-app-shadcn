"use client";

import { useEffect } from "react";

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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-green-400 font-mono">
        <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
        <p className="text-green-300 mb-6">
          Ocorreu um erro inesperado no sistema Matrix Bitcoin.
        </p>
        <button
          onClick={reset}
          className="bg-green-600 hover:bg-green-700 text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
