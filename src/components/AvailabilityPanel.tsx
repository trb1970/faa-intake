"use client";

import { useState, useEffect, useCallback } from "react";
import type { Slot, AvailabilityResponse } from "@/types";

interface AvailabilityPanelProps {
  selectedSlot: string | null;
  onSelectSlot: (slotDisplay: string | null) => void;
}

function shortTime(t: string): string {
  return t.replace(/:00/g, "").replace(/\s/g, "");
}

function formatDateHeading(dateStr: string): { dayName: string; dateLabel: string } {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { dayName, dateLabel };
}

function groupSlotsByDate(slots: Slot[]): Map<string, Slot[]> {
  const grouped = new Map<string, Slot[]>();
  for (const slot of slots) {
    const existing = grouped.get(slot.date) || [];
    existing.push(slot);
    grouped.set(slot.date, existing);
  }
  return grouped;
}

export default function AvailabilityPanel({ selectedSlot, onSelectSlot }: AvailabilityPanelProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [earliest, setEarliest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_AVAILABILITY_WEBHOOK_URL!);
      if (!res.ok) throw new Error("Failed to fetch availability");
      const data = await res.json();
      const payload: AvailabilityResponse = Array.isArray(data) ? data[0] : data;
      setSlots(payload.available_slots || []);
      setEarliest(payload.earliest_available || null);
    } catch {
      setError("Could not load availability. Please try again.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const grouped = groupSlotsByDate(slots);

  return (
    <div className="bg-[#161920] border border-[#252830] rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">Availability</h2>
        <button
          onClick={fetchAvailability}
          disabled={loading}
          className="px-3 py-1 border border-amber-500 text-amber-500 rounded text-sm font-mono hover:bg-amber-500/10 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Earliest Available */}
      <div className="mb-3 p-3 bg-[#0d0f14] border-l-4 border-green-500 rounded">
        <span className="text-xs text-gray-400 font-mono uppercase">Earliest Available</span>
        <p className="text-green-400 font-mono text-sm mt-0.5">
          {earliest || "\u2014"}
        </p>
      </div>

      {/* Selected Slot */}
      <div className="mb-4 p-3 bg-[#0d0f14] border-l-4 border-amber-500 rounded">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-mono uppercase">Selected Slot</span>
            <p className="text-amber-400 font-mono text-sm mt-0.5">
              {selectedSlot || "\u2014"}
            </p>
          </div>
          {selectedSlot && (
            <button
              onClick={() => onSelectSlot(null)}
              className="text-xs text-gray-400 hover:text-white border border-[#252830] rounded px-2 py-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Slot Cards */}
      {!loading && slots.length === 0 && !error && (
        <p className="text-gray-500 text-sm text-center py-8">
          No availability in the next 5 days.
        </p>
      )}

      <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {Array.from(grouped.entries()).map(([date, daySlots]) => {
          const { dayName, dateLabel } = formatDateHeading(date);
          return (
            <div key={date} className="bg-[#0d0f14] border border-[#252830] rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white font-semibold text-sm uppercase">{dayName}</span>
                  <span className="text-gray-500 text-xs ml-2">{dateLabel}</span>
                </div>
                <span className="text-green-400 font-mono text-xs">
                  {daySlots.length} open
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {daySlots.map((slot, i) => {
                  const isSelected = selectedSlot === slot.slot_display;
                  return (
                    <button
                      key={i}
                      onClick={() => onSelectSlot(slot.slot_display)}
                      title={slot.arrival_window}
                      className={`font-mono text-xs px-2 py-1.5 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(202,138,4,0.35)]"
                          : "border-green-600 bg-green-600/10 text-green-300 hover:bg-green-600/20 hover:shadow-[0_0_8px_rgba(22,163,74,0.25)]"
                      }`}
                    >
                      {shortTime(slot.start_time)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
