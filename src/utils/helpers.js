import { TITLES, MILESTONES } from './constants';

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function addDays(dateStr, n) {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + n);
  return date.toISOString().split('T')[0];
}

export function formatDate(d) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(d) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTitle(xp) {
  let t = TITLES[0];
  for (const tier of TITLES) {
    if (xp >= tier.min) t = tier;
  }
  return t;
}

export function getNextTitle(xp) {
  for (const tier of TITLES) {
    if (xp < tier.min) return tier;
  }
  return null;
}

export function baseXpForStreak(streak) {
  if (streak >= 30) return 25;
  if (streak >= 14) return 15;
  if (streak >= 7) return 10;
  return 5;
}

export function getStreakInfo(checkinDays, today) {
  if (!checkinDays || !checkinDays.length) {
    return { current: 0, longest: 0, total: 0, checkedToday: false };
  }

  const sorted = [...checkinDays].sort();
  const checkedToday = sorted.includes(today);

  // Calculate current streak
  let current = 0;
  let checkDate = checkedToday ? today : addDays(today, -1);
  while (sorted.includes(checkDate)) {
    current++;
    checkDate = addDays(checkDate, -1);
  }
  if (!checkedToday && !sorted.includes(addDays(today, -1))) {
    current = 0;
  }

  // Calculate longest streak
  let longest = 0;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }
  longest = Math.max(longest, current, sorted.length > 0 ? 1 : 0);

  return { current, longest, total: checkinDays.length, checkedToday };
}

export function getNextMilestone(currentStreak) {
  return MILESTONES.find((m) => m > currentStreak) || null;
}

export function getChartData(checkinDays, today, range) {
  const sorted = [...(checkinDays || [])].sort();
  const rangeMap = { week: 7, month: 30, quarter: 90, year: 365 };
  const n = rangeMap[range] || 30;
  const data = [];

  for (let i = n - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const checked = sorted.includes(date) ? 1 : 0;
    let streak = 0;
    if (checked) {
      streak = 1;
      let d = addDays(date, -1);
      while (sorted.includes(d)) {
        streak++;
        d = addDays(d, -1);
      }
    }
    data.push({
      date: formatDate(date),
      rawDate: date,
      checked,
      streak,
    });
  }
  return data;
}

export function getWeekKey(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(monday.getDate() + mondayOffset);
  return monday.toISOString().split('T')[0];
}

export function getMonthKey(dateStr) {
  return dateStr.substring(0, 7);
}

export function getWeekDays(weekKey) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekKey, i));
  }
  return days;
}

export function formatWeekRange(weekKey) {
  const monday = new Date(weekKey + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export function formatMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[m - 1]} ${y}`;
}

export function getWeeklyData(checkinDays, today) {
  const days = checkinDays || [];
  const weeks = [];

  for (let w = 11; w >= 0; w--) {
    const weekEnd = addDays(today, -w * 7);
    const weekStart = addDays(weekEnd, -6);
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      if (days.includes(d)) count++;
    }
    weeks.push({ week: formatDate(weekStart), days: count });
  }
  return weeks;
}
