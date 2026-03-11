export interface User {
  name: string;
  username: string;
}

export interface Slot {
  date: string;
  start_time: string;
  arrival_window: string;
  slot_display: string;
}

export interface AvailabilityResponse {
  earliest_available?: string;
  available_slots: Slot[];
}
