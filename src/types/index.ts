export interface DailyLog {
  id?: string;
  user_id?: string;
  date: string;
  anchor_therapy: boolean;
  anchor_sobriety: boolean;
  anchor_sleep: boolean;
  anchor_movement: boolean;
  mandate_exposure: boolean;
  mandate_coursework: boolean;
  mandate_interaction: boolean;
  night_anchor_completed: boolean;
  notes?: string | null;
  score?: number | null;
}
