import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';
import {
  getToday,
  getMonthKey,
  addDays,
  formatMonth,
} from '../utils/helpers';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

export default function MonthlyScreen() {
  const {
    quests,
    monthlyGoals,
    addMonthlyGoal,
    toggleMonthlyGoal,
    deleteMonthlyGoal,
    toastMessage,
  } = useApp();
  const { wrapperStyle, contentStyle } = useScreenLayout();

  const today = getToday();
  const currentMonthKey = getMonthKey(today);
  const [monthOffset, setMonthOffset] = useState(0);

  const getOffsetMonth = (offset) => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const total = y * 12 + (m - 1) + offset;
    const ny = Math.floor(total / 12);
    const nm = (total % 12) + 1;
    return `${ny}-${String(nm).padStart(2, '0')}`;
  };
  const monthKey = getOffsetMonth(monthOffset);
  const isCurrentMonth = monthOffset === 0;

  const monthData = monthlyGoals[monthKey] || {};
  const [newGoalText, setNewGoalText] = useState({});
  const [showInput, setShowInput] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = (questId) => {
    const text = (newGoalText[questId] || '').trim();
    if (!text) return;
    addMonthlyGoal(monthKey, questId, text);
    setNewGoalText((prev) => ({ ...prev, [questId]: '' }));
    setShowInput((prev) => ({ ...prev, [questId]: false }));
  };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Monthly goals</Text>
        <Text style={styles.subtitle}>
          Set specific goals under each quest for the month and tick them off as
          you go.
        </Text>

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => setMonthOffset(monthOffset - 1)}
            style={styles.navBtn}
          >
            <Feather name="chevron-left" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.monthLabel}>
            <Text style={styles.monthText}>{formatMonth(monthKey)}</Text>
            {isCurrentMonth && (
              <Text style={styles.currentBadge}>This month</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!isCurrentMonth) setMonthOffset(monthOffset + 1);
            }}
            style={[styles.navBtn, isCurrentMonth && { opacity: 0.3 }]}
            disabled={isCurrentMonth}
          >
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Quest cards */}
        {quests.map((q) => {
          const goals = monthData[q.id] || [];
          const doneCount = goals.filter((g) => g.done).length;
          const total = goals.length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

          return (
            <View key={q.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <View
                  style={[styles.iconBox, { backgroundColor: q.color + '14' }]}
                >
                  <Feather name={q.icon} size={16} color={q.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.questName}>{q.name}</Text>
                  {total > 0 && (
                    <Text style={styles.questSub}>
                      {doneCount}/{total} completed
                    </Text>
                  )}
                </View>
                {total > 0 && (
                  <Text
                    style={[
                      styles.pctBadge,
                      {
                        color:
                          pct === 100
                            ? '#059669'
                            : pct >= 50
                            ? '#D97706'
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {pct}%
                  </Text>
                )}
              </View>

              {/* Progress bar */}
              {total > 0 && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor:
                          pct === 100
                            ? '#059669'
                            : pct >= 50
                            ? '#D97706'
                            : q.color,
                      },
                    ]}
                  />
                </View>
              )}

              {/* Goals list */}
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => toggleMonthlyGoal(monthKey, q.id, g.id)}
                  activeOpacity={0.7}
                  style={styles.goalRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      g.done && {
                        backgroundColor: q.color,
                        borderColor: q.color,
                      },
                    ]}
                  >
                    {g.done && (
                      <Feather name="check" size={12} color={colors.white} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.goalText,
                      g.done && styles.goalTextDone,
                    ]}
                  >
                    {g.text}
                  </Text>
                  {confirmDelete === g.id ? (
                    <View style={styles.deleteConfirmRow}>
                      <TouchableOpacity
                        onPress={() => {
                          deleteMonthlyGoal(monthKey, q.id, g.id);
                          setConfirmDelete(null);
                        }}
                        style={styles.deleteYes}
                      >
                        <Feather name="trash-2" size={12} color={colors.danger} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setConfirmDelete(null)}
                        style={styles.deleteNo}
                      >
                        <Feather name="x" size={12} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setConfirmDelete(g.id)}
                      style={{ padding: 4 }}
                    >
                      <Feather name="trash-2" size={13} color="#ddd" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}

              {/* Add goal */}
              {showInput[q.id] ? (
                <View style={styles.addRow}>
                  <TextInput
                    value={newGoalText[q.id] || ''}
                    onChangeText={(t) =>
                      setNewGoalText((prev) => ({ ...prev, [q.id]: t }))
                    }
                    placeholder="e.g. Complete patterns in C++"
                    style={styles.goalInput}
                    placeholderTextColor="#bbb"
                    onSubmitEditing={() => handleAdd(q.id)}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => handleAdd(q.id)}
                    style={[styles.addBtn, { backgroundColor: q.color }]}
                  >
                    <Feather name="plus" size={16} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setShowInput((prev) => ({ ...prev, [q.id]: false }))
                    }
                    style={styles.cancelBtn}
                  >
                    <Feather name="x" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    setShowInput((prev) => ({ ...prev, [q.id]: true }))
                  }
                  style={styles.addGoalTrigger}
                >
                  <Feather name="plus" size={14} color={q.color} />
                  <Text style={[styles.addGoalText, { color: q.color }]}>
                    Add goal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Summary */}
        {quests.some((q) => (monthData[q.id] || []).length > 0) && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Month summary</Text>
            {quests.map((q) => {
              const goals = monthData[q.id] || [];
              if (goals.length === 0) return null;
              const done = goals.filter((g) => g.done).length;
              const pct = Math.round((done / goals.length) * 100);
              return (
                <View key={q.id} style={styles.summaryRow}>
                  <View style={styles.summaryLeft}>
                    <Feather name={q.icon} size={14} color={q.color} />
                    <Text style={styles.summaryName}>{q.name}</Text>
                  </View>
                  <View style={styles.summaryBarTrack}>
                    <View
                      style={[
                        styles.summaryBarFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: q.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.summaryPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <Toast message={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { paddingTop: spacing.lg, paddingBottom: 32 },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSizes.body - 1,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    padding: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  monthLabel: { alignItems: 'center' },
  monthText: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  currentBadge: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    fontWeight: fontWeights.semibold,
    marginTop: 2,
  },
  questCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questName: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  questSub: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  pctBadge: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.bold,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  goalTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  deleteConfirmRow: {
    flexDirection: 'row',
    gap: 4,
  },
  deleteYes: {
    padding: 4,
    backgroundColor: colors.dangerBg,
    borderRadius: 4,
  },
  deleteNo: {
    padding: 4,
    backgroundColor: colors.surface,
    borderRadius: 4,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: fontSizes.body,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    padding: 8,
  },
  addGoalTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd',
  },
  addGoalText: {
    fontSize: fontSizes.body - 1,
    fontWeight: fontWeights.semibold,
  },
  summary: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
  },
  summaryTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 100,
  },
  summaryName: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  summaryBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  summaryPct: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    color: colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
});
