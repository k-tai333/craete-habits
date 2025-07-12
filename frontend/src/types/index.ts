export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Habit {
  id: number;
  userId: number;
  title: string;
  to_do: string;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitRecord {
  id: number;
  habitId: number;
  date: string;
  status: 'circle' | 'triangle' | 'cross';
  achievement_level: number;
}

export type Status = 'circle' | 'triangle' | 'cross'; 