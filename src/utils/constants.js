export const TITLES = [
  { min: 0, title: 'Novice', icon: '🌱' },
  { min: 100, title: 'Apprentice', icon: '⚡' },
  { min: 300, title: 'Warrior', icon: '🔥' },
  { min: 600, title: 'Champion', icon: '💎' },
  { min: 1000, title: 'Master', icon: '👑' },
  { min: 1800, title: 'Legend', icon: '🏆' },
  { min: 3000, title: 'Mythic', icon: '✨' },
];

export const IMPORTANCE_LEVELS = [
  { value: 1, label: 'Normal', xpLabel: '5–25 XP', color: '#6B7280' },
  { value: 2, label: 'Important', xpLabel: '10–50 XP', color: '#D97706' },
  { value: 3, label: 'Critical', xpLabel: '15–75 XP', color: '#DC2626' },
];

export const DURATION_OPTIONS = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 30, label: '1 month' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
  { value: 0, label: 'Ongoing' },
];

export const QUEST_ICONS = [
  { icon: 'code', label: 'Code' },
  { icon: 'globe', label: 'Web' },
  { icon: 'book-open', label: 'Read' },
  { icon: 'activity', label: 'Gym' },
  { icon: 'edit-3', label: 'Write' },
  { icon: 'music', label: 'Music' },
  { icon: 'palette', label: 'Art' },
  { icon: 'zap', label: 'Run' },
  { icon: 'heart', label: 'Health' },
  { icon: 'target', label: 'Focus' },
  { icon: 'sun', label: 'Learn' },
  { icon: 'feather', label: 'Habit' },
];

export const QUEST_COLORS = [
  '#534AB7',
  '#0F6E56',
  '#D85A30',
  '#993556',
  '#185FA5',
  '#639922',
  '#BA7517',
  '#854F0B',
];

export const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

export const STORAGE_KEY = 'streakforge-data-v2';
