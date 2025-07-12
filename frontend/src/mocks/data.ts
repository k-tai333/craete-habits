import { User, Habit, HabitRecord } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: '山田太郎',
    email: 'yamada@example.com',
  },
];

export const mockHabits: Habit[] = [
  {
    id: 1,
    userId: 1,
    name: '運動する',
    description: '毎日30分のウォーキング',
    createdAt: '2024-03-20',
  },
  {
    id: 2,
    userId: 1,
    name: '読書',
    description: '1日30ページ読む',
    createdAt: '2024-03-20',
  },
  {
    id: 3,
    userId: 1,
    name: '瞑想',
    description: '朝10分の瞑想',
    createdAt: '2024-03-20',
  },
];

export const mockHabitRecords: HabitRecord[] = [
  {
    id: 1,
    habitId: 1,
    date: '2024-03-20',
    status: 'circle',
  },
  {
    id: 2,
    habitId: 1,
    date: '2024-03-21',
    status: 'triangle',
  },
  {
    id: 3,
    habitId: 2,
    date: '2024-03-20',
    status: 'circle',
  },
]; 