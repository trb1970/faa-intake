"use client";

import { useState } from "react";
import { USERS } from "@/config/users";
import type { User } from "@/types";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const found = USERS.find(
      (u) => u.username === username.toLowerCase().trim() && u.password === password
    );

    if (found) {
      const user: User = { name: found.name, username: found.username };
      localStorage.setItem("faa_user", JSON.stringify(user));
      onLogin(user);
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] px-4">
      <div className="w-full max-w-sm bg-[#161920] border border-[#252830] rounded-lg p-8 shadow-lg">
        <div className="text-center mb-6">
          <p className="text-amber-500 font-mono text-xs uppercase tracking-widest mb-1">
            Fast Affordable Air
          </p>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
            Live Intake
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0f14] border border-[#252830] rounded text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0f14] border border-[#252830] rounded text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
