export interface User {
  name: string;
  username: string;
}

export interface Slot {
  date: string;
  start_time: string;
  arrival_window: string;
  slot_display: string;
  tech_id?: string;
  tech_first_name?: string;
  tech_last_name?: string;
  available_techs?: number;
}

export interface AvailabilityResponse {
  earliest_available?: string;
  available_slots: Slot[];
}
