"use client";

import { useState, useEffect } from "react";
import MatrixLogin from "@/components/MatrixLogin";
import Dashboard from "@/components/Dashboard";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for existing login state on component mount
  useEffect(() => {
    const savedLoginState = localStorage.getItem('backtest_logged_in');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('backtest_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('backtest_logged_in');
  };

  // Show loading while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <MatrixLogin onLoginSuccess={handleLoginSuccess} />;
}
