"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/env";

interface MatrixLoginProps {
  onLoginSuccess: () => void;
}

const MatrixLogin = ({ onLoginSuccess }: MatrixLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [matrixChars, setMatrixChars] = useState<Array<{
    char: string;
    x: number;
    y: number;
    speed: number;
    opacity: number;
    size: number;
  }>>([]);

  // Efeito para criar caracteres Matrix caindo
  useEffect(() => {
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン₿⚡🔒🔐💻🌐";
    const interval = setInterval(() => {
      setMatrixChars(prev => {
        const newChars = [...prev];
        if (newChars.length > 50) {
          newChars.shift();
        }
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        if (randomChar) {
          newChars.push({
            char: randomChar,
            x: Math.random() * 100,
            y: -Math.random() * 100,
            speed: Math.random() * 3 + 1,
            opacity: Math.random() * 0.8 + 0.2,
            size: Math.random() * 20 + 10
          });
        }
        return newChars;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Efeito para animar os caracteres
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setMatrixChars(prev => 
        prev.map(char => ({
          ...char,
          y: char.y + char.speed,
          opacity: char.y > 100 ? 0 : char.opacity
        })).filter(char => char.y < 120)
      );
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar credenciais
    if (username === env.NEXT_PUBLIC_LOGIN_USERNAME && password === env.NEXT_PUBLIC_LOGIN_PASSWORD) {
      try {
        // Usar NextAuth signIn com provider Matrix
        const result = await signIn("Matrix", {
          username,
          password,
          redirect: false,
        });

        if (result?.ok) {
          onLoginSuccess();
        } else {
          setError("Erro ao fazer login. Tente novamente.");
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        setError("Erro de conexão. Tente novamente.");
      }
    } else {
      setError("Credenciais inválidas. Tente novamente.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid Matrix de fundo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px),
            linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Caracteres Matrix caindo */}
      {matrixChars.map((char, index) => (
        <div
          key={index}
          className="absolute text-green-400 font-mono pointer-events-none"
          style={{
            left: `${char.x}%`,
            top: `${char.y}%`,
            fontSize: `${char.size}px`,
            opacity: char.opacity,
            textShadow: `0 0 8px rgba(0,255,0,${char.opacity})`,
            animation: `glow ${char.speed}s infinite linear`
          }}
        >
          {char.char}
        </div>
      ))}

      {/* Linhas de energia Matrix */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-30"
            style={{
              top: `${(i * 12.5)}%`,
              left: '0',
              right: '0',
              animation: `scan ${3 + i * 0.5}s infinite linear`
            }}
          />
        ))}
      </div>

      {/* Overlay verde sutil com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-green-800/20 pointer-events-none" />

      {/* Efeito de partículas flutuantes */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-40"
            style={{
              left: `${(i * 7 + 13) % 100}%`,
              top: `${(i * 11 + 17) % 100}%`,
              animation: `float ${5 + (i % 10)}s infinite ease-in-out`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-black/90 border-green-500/70 backdrop-blur-md shadow-2xl shadow-green-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-green-400 text-3xl font-mono font-bold tracking-wider">
              BACKTESTING BITCOIN OBSERVATORIUM
            </CardTitle>
            <p className="text-green-300/80 text-sm font-mono mt-2">
              Matrix Authentication System
            </p>
            <div className="flex justify-center space-x-2 mt-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-green-300 text-sm font-mono font-semibold">
                  USERNAME
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/60 border-green-500/60 text-green-300 placeholder:text-green-300/50 font-mono focus:border-green-400 focus:ring-green-400/30 focus:bg-black/80 transition-all duration-300"
                  placeholder="Enter your username..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-green-300 text-sm font-mono font-semibold">
                  PASSWORD
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/60 border-green-500/60 text-green-300 placeholder:text-green-300/50 font-mono focus:border-green-400 focus:ring-green-400/30 focus:bg-black/80 transition-all duration-300"
                  placeholder="Enter your password..."
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm font-mono text-center bg-red-900/30 p-3 rounded border border-red-500/50 backdrop-blur-sm">
                  Invalid credentials. Please try again.
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-mono font-bold py-3 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/40 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>CONNECTING...</span>
                  </div>
                ) : (
                  "ACCESS SYSTEM"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-green-300/60 text-xs font-mono">
                ⚡ Powered by Blockchain Technology
              </p>
              <p className="text-green-300/40 text-xs font-mono mt-1">
                ₿ Decentralized & Secure
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 8px rgba(0,255,0,0.8); }
          50% { text-shadow: 0 0 15px rgba(0,255,0,1); }
        }
        
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default MatrixLogin;
