"use client";

import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import IntakeForm from "@/components/IntakeForm";
import AvailabilityPanel from "@/components/AvailabilityPanel";
import type { User, Slot } from "@/types";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("faa_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("faa_user");
      }
    }
    setLoading(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem("faa_user");
    setUser(null);
    setSelectedSlot(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14]">
        <p className="text-gray-500 font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0f14]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0f14] border-b border-[#252830] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-amber-500 font-mono text-xs uppercase tracking-widest">
              Fast Affordable Air
            </p>
            <h1 className="text-xl font-bold text-white uppercase tracking-wide">
              Live Intake
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#0d0f14] bg-amber-500 font-mono text-xs font-bold px-2 py-0.5 rounded">
              v0.5
            </span>
            <span className="text-gray-400 text-sm">
              Logged in as <span className="text-white font-semibold">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 border border-[#252830] text-gray-400 hover:text-white hover:border-gray-500 rounded text-sm transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column — Intake Form */}
          <IntakeForm
            user={user}
            selectedSlot={selectedSlot}
            onClearSlot={() => setSelectedSlot(null)}
          />

          {/* Right Column — Availability */}
          <AvailabilityPanel
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </div>
      </main>
    </div>
  );
}
