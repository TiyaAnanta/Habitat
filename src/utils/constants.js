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
  { value: 3, label: 'High', xpLabel: '15–75 XP', color: '#DC2626' },
  { value: 4, label: 'Critical', xpLabel: '20–100 XP', color: '#9333EA' },
  { value: 5, label: 'Legendary', xpLabel: '25–125 XP', color: '#E11D48' },
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
  { from: '#534AB7', to: '#8B5CF6' },
  { from: '#0F6E56', to: '#34D399' },
  { from: '#D85A30', to: '#FB923C' },
  { from: '#993556', to: '#F472B6' },
  { from: '#185FA5', to: '#60A5FA' },
  { from: '#639922', to: '#A3E635' },
  { from: '#BA7517', to: '#FBBF24' },
  { from: '#854F0B', to: '#D97706' },
  { from: '#DC2626', to: '#F87171' },
  { from: '#7C3AED', to: '#C084FC' },
];

export const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

export const STORAGE_KEY = 'streakforge-data-v2';
