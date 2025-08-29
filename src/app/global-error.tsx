"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center text-green-400 font-mono">
            <h2 className="text-2xl font-bold mb-4">Erro Crítico do Sistema</h2>
            <p className="text-green-300 mb-6">
              Ocorreu um erro crítico no sistema Matrix Bitcoin.
            </p>
            <button
              onClick={reset}
              className="bg-green-600 hover:bg-green-700 text-black font-bold py-2 px-4 rounded transition-colors"
            >
              Reiniciar Sistema
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
