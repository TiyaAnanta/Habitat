import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getToday, addDays, baseXpForStreak, getStreakInfo } from '../utils/helpers';
import { MILESTONES } from '../utils/constants';

const AppContext = createContext(null);

const DEFAULT_QUESTS = [
  {
    id: 'dsa',
    name: 'DSA practice',
    icon: 'code',
    color: '#534AB7',
    importance: 2,
    durationDays: 180,
    startDate: getToday(),
    goals: [
      { id: 'g1', text: 'Complete C++ basics by end of week', createdAt: getToday(), done: false },
    ],
  },
  {
    id: 'webdev',
    name: 'Web development',
    icon: 'globe',
    color: '#0F6E56',
    importance: 2,
    durationDays: 365,
    startDate: getToday(),
    goals: [
      { id: 'g2', text: 'Build 3 projects for portfolio', createdAt: getToday(), done: false },
    ],
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: 'book-open',
    color: '#D85A30',
    importance: 1,
    durationDays: 0,
    startDate: getToday(),
    goals: [],
  },
  {
    id: 'workout',
    name: 'Workout',
    icon: 'activity',
    color: '#993556',
    importance: 1,
    durationDays: 0,
    startDate: getToday(),
    goals: [],
  },
];

export function AppProvider({ children }) {
  const [quests, setQuests] = useState(DEFAULT_QUESTS);
  const [checkinHistory, setCheckinHistory] = useState({});
  // What was actually done, per quest per day: { [questId]: { [date]: text } }
  const [logs, setLogs] = useState({});
  const [xp, setXp] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimer = useRef(null);
  const { loadData, saveData } = useStorage();

  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data) {
        if (data.quests) setQuests(data.quests);
        if (data.checkinHistory) setCheckinHistory(data.checkinHistory);
        if (data.xp != null) setXp(data.xp);
        if (data.logs) setLogs(data.logs);
      }
      setLoaded(true);
    })();
  }, []);

  // Mirrors `logs` so save() can default to the current value. Without this,
  // every existing save(q, ch, x) call would drop notes on the floor.
  const logsRef = useRef(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  const save = useCallback(
    async (q, ch, x, lg) => {
      await saveData({ quests: q, checkinHistory: ch, xp: x, logs: lg ?? logsRef.current });
    },
    [saveData]
  );

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2400);
  }, []);

  const checkin = useCallback(
    (questId) => {
      const today = getToday();
      const days = checkinHistory[questId] || [];
      if (days.includes(today)) return;

      const quest = quests.find((q) => q.id === questId);
      const mult = quest?.importance || 1;
      const newDays = [...days, today];
      const newHistory = { ...checkinHistory, [questId]: newDays };

      // Calculate streak after adding today
      const sorted = [...newDays].sort();
      let streak = 0;
      let d = today;
      while (sorted.includes(d)) {
        streak++;
        d = addDays(d, -1);
      }

      const earned = baseXpForStreak(streak) * mult;
      const newXp = xp + earned;

      setCheckinHistory(newHistory);
      setXp(newXp);
      save(quests, newHistory, newXp);

      const milestone = MILESTONES.find((m) => m === streak);
      if (milestone) {
        showToast(`${milestone}-day streak! +${earned} XP`);
      } else {
        showToast(`+${earned} XP`);
      }

      // Check if all quests done today
      const allDone = quests.every((q) => {
        const qDays = q.id === questId ? newDays : checkinHistory[q.id] || [];
        return qDays.includes(today);
      });
      if (allDone && quests.length > 1) {
        const bonusXp = newXp + 10;
        setXp(bonusXp);
        save(quests, newHistory, bonusXp);
        setTimeout(() => showToast('All quests done! +10 bonus'), 1200);
      }
    },
    [checkinHistory, quests, xp, save, showToast]
  );

  const uncheckin = useCallback(
    (questId) => {
      const today = getToday();
      const days = checkinHistory[questId] || [];
      if (!days.includes(today)) return;

      const quest = quests.find((q) => q.id === questId);
      const mult = quest?.importance || 1;

      // Calculate XP that was earned for this check-in
      const sorted = [...days].sort();
      let streak = 0;
      let d = today;
      while (sorted.includes(d)) {
        streak++;
        d = addDays(d, -1);
      }
      const lostXp = baseXpForStreak(streak) * mult;

      const newDays = days.filter((dd) => dd !== today);
      const newHistory = { ...checkinHistory, [questId]: newDays };
      const newXp = Math.max(0, xp - lostXp);

      setCheckinHistory(newHistory);
      setXp(newXp);
      save(quests, newHistory, newXp);
      showToast(`-${lostXp} XP removed`);
    },
    [checkinHistory, quests, xp, save, showToast]
  );

  const addQuest = useCallback(
    (questData) => {
      const newQ = {
        id: `q_${Date.now()}`,
        ...questData,
        startDate: getToday(),
        goals: [],
      };
      const newQuests = [...quests, newQ];
      setQuests(newQuests);
      save(newQuests, checkinHistory, xp);
      showToast('Quest created');
    },
    [quests, checkinHistory, xp, save, showToast]
  );

  const permanentDeleteQuest = useCallback(
    (id) => {
      const days = checkinHistory[id] || [];
      const quest = quests.find((q) => q.id === id);
      const mult = quest?.importance || 1;

      // Calculate total XP earned from this quest
      let xpToRemove = 0;
      const sorted = [...days].sort();
      sorted.forEach((day, i) => {
        let streak = 1;
        for (let j = i - 1; j >= 0; j--) {
          if (
            Math.round((new Date(sorted[j + 1]) - new Date(sorted[j])) / 86400000) === 1
          ) {
            streak++;
          } else {
            break;
          }
        }
        xpToRemove += baseXpForStreak(streak) * mult;
      });

      const newQuests = quests.filter((q) => q.id !== id);
      const newHistory = { ...checkinHistory };
      delete newHistory[id];
      const newLogs = { ...logs };
      delete newLogs[id];
      const newXp = Math.max(0, xp - xpToRemove);

      setQuests(newQuests);
      setCheckinHistory(newHistory);
      setLogs(newLogs);
      setXp(newXp);
      save(newQuests, newHistory, newXp, newLogs);
      showToast('Quest permanently deleted');
    },
    [quests, checkinHistory, logs, xp, save, showToast]
  );

  const addGoal = useCallback(
    (questId, text) => {
      const newQuests = quests.map((q) =>
        q.id === questId
          ? {
              ...q,
              goals: [
                ...q.goals,
                { id: `g_${Date.now()}`, text, createdAt: getToday(), done: false },
              ],
            }
          : q
      );
      setQuests(newQuests);
      save(newQuests, checkinHistory, xp);
    },
    [quests, checkinHistory, xp, save]
  );

  const toggleGoal = useCallback(
    (questId, goalId) => {
      const newQuests = quests.map((q) =>
        q.id === questId
          ? {
              ...q,
              goals: q.goals.map((g) =>
                g.id === goalId ? { ...g, done: !g.done } : g
              ),
            }
          : q
      );
      setQuests(newQuests);
      save(newQuests, checkinHistory, xp);
    },
    [quests, checkinHistory, xp, save]
  );

  const deleteGoal = useCallback(
    (questId, goalId) => {
      const newQuests = quests.map((q) =>
        q.id === questId
          ? { ...q, goals: q.goals.filter((g) => g.id !== goalId) }
          : q
      );
      setQuests(newQuests);
      save(newQuests, checkinHistory, xp);
      showToast('Goal removed');
    },
    [quests, checkinHistory, xp, save, showToast]
  );

  const setQuestLog = useCallback(
    (questId, text) => {
      const today = getToday();
      const questLogs = { ...(logs[questId] || {}) };
      const trimmed = text.trim();
      if (trimmed) questLogs[today] = trimmed;
      else delete questLogs[today];

      const newLogs = { ...logs, [questId]: questLogs };
      setLogs(newLogs);
      save(quests, checkinHistory, xp, newLogs);
    },
    [logs, quests, checkinHistory, xp, save]
  );

  const resetAll = useCallback(async () => {
    setQuests(DEFAULT_QUESTS);
    setCheckinHistory({});
    setLogs({});
    setXp(0);
    save(DEFAULT_QUESTS, {}, 0, {});
    showToast('All progress reset');
  }, [save, showToast]);

  return (
    <AppContext.Provider
      value={{
        quests,
        checkinHistory,
        logs,
        xp,
        loaded,
        toastMessage,
        checkin,
        uncheckin,
        setQuestLog,
        addQuest,
        permanentDeleteQuest,
        addGoal,
        toggleGoal,
        deleteGoal,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
