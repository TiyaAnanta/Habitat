import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';
import {
  getToday,
  getWeekKey,
  addDays,
  formatWeekRange,
} from '../utils/helpers';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

export default function WeeklyScreen() {
  const {
    quests,
    weeklyProgress,
    weeklyGoalTexts,
    setWeeklyQuestProgress,
    setWeeklyGoalText,
    toastMessage,
  } = useApp();
  const { wrapperStyle, contentStyle, contentWidth } = useScreenLayout();
  const chartWidth = contentWidth - 8;

  const today = getToday();
  const currentWeekKey = getWeekKey(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekKey = addDays(currentWeekKey, weekOffset * 7);
  const isCurrentWeek = weekOffset === 0;

  const weekData = weeklyProgress[weekKey] || {};
  const goalTexts = weeklyGoalTexts[weekKey] || {};
  const [editValues, setEditValues] = useState({});
  const [editGoals, setEditGoals] = useState({});

  const handleSave = (questId) => {
    const raw = editValues[questId];
    if (raw == null) return;
    const val = parseFloat(raw);
    if (isNaN(val) || val < 0) return;
    setWeeklyQuestProgress(weekKey, questId, val);
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[questId];
      return next;
    });
  };

  const getProgressColor = (val) => {
    if (val > 1) return '#059669';
    if (val === 1) return colors.accent;
    if (val >= 0.5) return '#D97706';
    return '#DC2626';
  };

  const getProgressLabel = (val) => {
    if (val > 1) return 'Overachieved!';
    if (val === 1) return 'Complete';
    if (val > 0) return `${Math.round(val * 100)}%`;
    return 'Not started';
  };

  // Chart data: individual quests
  const questChartData = useMemo(() => {
    const labels = quests.map((q) => q.name.length > 8 ? q.name.substring(0, 7) + '..' : q.name);
    const data = quests.map((q) => weekData[q.id] || 0);
    return { labels, data };
  }, [quests, weekData]);

  // History chart: last 8 weeks aggregate
  const historyData = useMemo(() => {
    const labels = [];
    const data = [];
    for (let i = 7; i >= 0; i--) {
      const wk = addDays(currentWeekKey, -i * 7);
      const wd = weeklyProgress[wk] || {};
      const avg =
        quests.length > 0
          ? quests.reduce((sum, q) => sum + (wd[q.id] || 0), 0) / quests.length
          : 0;
      const d = new Date(wk + 'T00:00:00');
      labels.push(
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      data.push(Math.round(avg * 100) / 100);
    }
    return { labels, data };
  }, [weeklyProgress, quests, currentWeekKey]);

  // Per-quest history: last 8 weeks
  const perQuestHistory = useMemo(() => {
    return quests.map((q) => {
      const labels = [];
      const data = [];
      for (let i = 7; i >= 0; i--) {
        const wk = addDays(currentWeekKey, -i * 7);
        const wd = weeklyProgress[wk] || {};
        const d = new Date(wk + 'T00:00:00');
        labels.push(
          d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
        data.push(wd[q.id] || 0);
      }
      return { quest: q, labels, data };
    });
  }, [weeklyProgress, quests, currentWeekKey]);

  const chartConfig = {
    backgroundGradientFrom: '#f9f9f8',
    backgroundGradientTo: '#f9f9f8',
    color: () => colors.accent,
    fillShadowGradientFrom: colors.accent,
    fillShadowGradientTo: colors.accent,
    fillShadowGradientFromOpacity: 0.4,
    fillShadowGradientToOpacity: 0.05,
    labelColor: () => '#aaa',
    propsForLabels: { fontSize: 9 },
    decimalPlaces: 1,
    propsForBackgroundLines: { stroke: '#eee' },
    barPercentage: 0.6,
  };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Weekly progress</Text>
        <Text style={styles.subtitle}>
          Track how much of each quest's weekly goal you completed. 1 = done,{' '}
          {'<'}1 = partial, {'>'}1 = overachieved.
        </Text>

        {/* Week navigator */}
        <View style={styles.weekNav}>
          <TouchableOpacity
            onPress={() => setWeekOffset(weekOffset - 1)}
            style={styles.navBtn}
          >
            <Feather name="chevron-left" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.weekLabel}>
            <Text style={styles.weekText}>{formatWeekRange(weekKey)}</Text>
            {isCurrentWeek && (
              <Text style={styles.currentBadge}>This week</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!isCurrentWeek) setWeekOffset(weekOffset + 1);
            }}
            style={[styles.navBtn, isCurrentWeek && { opacity: 0.3 }]}
            disabled={isCurrentWeek}
          >
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Quest progress cards */}
        {quests.map((q) => {
          const saved = weekData[q.id];
          const isEditing = editValues[q.id] != null;
          const displayVal = saved != null ? saved : null;
          const savedGoal = goalTexts[q.id] || '';
          const isEditingGoal = editGoals[q.id] != null;

          return (
            <View key={q.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <View
                  style={[styles.iconBox, { backgroundColor: q.color + '14' }]}
                >
                  <Feather name={q.icon} size={16} color={q.color} />
                </View>
                <Text style={styles.questName}>{q.name}</Text>
              </View>

              {/* Weekly goal text */}
              {isEditingGoal ? (
                <View style={styles.goalInputRow}>
                  <TextInput
                    value={editGoals[q.id] ?? ''}
                    onChangeText={(t) =>
                      setEditGoals((prev) => ({ ...prev, [q.id]: t }))
                    }
                    placeholder="What's your goal this week?"
                    style={styles.goalInput}
                    placeholderTextColor="#bbb"
                    onBlur={() => {
                      setWeeklyGoalText(weekKey, q.id, editGoals[q.id] || '');
                      setEditGoals((prev) => {
                        const next = { ...prev };
                        delete next[q.id];
                        return next;
                      });
                    }}
                    autoFocus
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    setEditGoals((prev) => ({ ...prev, [q.id]: savedGoal }))
                  }
                  style={styles.goalDisplay}
                >
                  {savedGoal ? (
                    <Text style={styles.goalText} numberOfLines={2}>
                      {savedGoal}
                    </Text>
                  ) : (
                    <Text style={styles.goalPlaceholder}>
                      + Set a weekly goal...
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {displayVal != null && !isEditing ? (
                <View style={styles.progressRow}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(displayVal, 1) * 100}%`,
                          backgroundColor: getProgressColor(displayVal),
                        },
                      ]}
                    />
                    {displayVal > 1 && (
                      <View
                        style={[
                          styles.barOverflow,
                          {
                            width: `${Math.min(displayVal - 1, 0.5) / 0.5 * 100}%`,
                            backgroundColor: '#059669',
                            opacity: 0.35,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.valueRow}>
                    <Text
                      style={[
                        styles.progressValue,
                        { color: getProgressColor(displayVal) },
                      ]}
                    >
                      {displayVal.toFixed(2)}
                    </Text>
                    <Text style={styles.progressLabel}>
                      {getProgressLabel(displayVal)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setEditValues((prev) => ({
                        ...prev,
                        [q.id]: String(displayVal),
                      }))
                    }
                    style={styles.editBtn}
                  >
                    <Feather name="edit-2" size={13} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.inputRow}>
                  <TextInput
                    value={editValues[q.id] ?? ''}
                    onChangeText={(t) =>
                      setEditValues((prev) => ({ ...prev, [q.id]: t }))
                    }
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={styles.decimalInput}
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    onPress={() => handleSave(q.id)}
                    style={[styles.saveBtn, { backgroundColor: q.color }]}
                  >
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                  {displayVal != null && (
                    <TouchableOpacity
                      onPress={() =>
                        setEditValues((prev) => {
                          const next = { ...prev };
                          delete next[q.id];
                          return next;
                        })
                      }
                      style={styles.cancelEditBtn}
                    >
                      <Feather name="x" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Charts section */}
        <Text style={styles.sectionTitle}>This week's breakdown</Text>
        {quests.length > 0 && questChartData.data.some((d) => d > 0) ? (
          <View style={styles.chartBox}>
            <BarChart
              data={{
                labels: questChartData.labels,
                datasets: [{ data: questChartData.data }],
              }}
              width={chartWidth}
              height={180}
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              style={{ borderRadius: radii.md }}
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              Log progress above to see the chart
            </Text>
          </View>
        )}

        {/* Aggregate history */}
        <Text style={styles.sectionTitle}>8-week average progress</Text>
        <Text style={styles.chartCaption}>
          Average completion across all quests per week
        </Text>
        {historyData.data.some((d) => d > 0) ? (
          <View style={styles.chartBox}>
            <BarChart
              data={{
                labels: historyData.labels.filter((_, i) => i % 2 === 0),
                datasets: [{ data: historyData.data }],
              }}
              width={chartWidth}
              height={180}
              chartConfig={{
                ...chartConfig,
                color: () => '#059669',
                fillShadowGradientFrom: '#059669',
                fillShadowGradientTo: '#059669',
              }}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              style={{ borderRadius: radii.md }}
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              No weekly data yet
            </Text>
          </View>
        )}

        {/* Per-quest history */}
        <Text style={styles.sectionTitle}>Individual quest trends</Text>
        {perQuestHistory.map(({ quest: q, labels, data }) => {
          if (!data.some((d) => d > 0)) return null;
          return (
            <View key={q.id} style={{ marginBottom: spacing.lg }}>
              <View style={styles.questChartHeader}>
                <View
                  style={[
                    styles.iconBoxSm,
                    { backgroundColor: q.color + '14' },
                  ]}
                >
                  <Feather name={q.icon} size={12} color={q.color} />
                </View>
                <Text style={styles.questChartName}>{q.name}</Text>
              </View>
              <View style={styles.chartBox}>
                <BarChart
                  data={{
                    labels: labels.filter((_, i) => i % 2 === 0),
                    datasets: [{ data }],
                  }}
                  width={chartWidth}
                  height={140}
                  chartConfig={{
                    ...chartConfig,
                    color: () => q.color,
                    fillShadowGradientFrom: q.color,
                    fillShadowGradientTo: q.color,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  style={{ borderRadius: radii.md }}
                />
              </View>
            </View>
          );
        })}
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
  weekNav: {
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
  weekLabel: { alignItems: 'center' },
  weekText: {
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
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: radii.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  barOverflow: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: radii.pill,
  },
  goalInputRow: {
    marginBottom: spacing.sm,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: colors.accent + '40',
    borderRadius: 8,
    padding: 8,
    fontSize: fontSizes.body - 1,
    color: colors.textPrimary,
    backgroundColor: colors.accent + '06',
  },
  goalDisplay: {
    marginBottom: spacing.sm,
    paddingVertical: 4,
  },
  goalText: {
    fontSize: fontSizes.body - 1,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  goalPlaceholder: {
    fontSize: fontSizes.caption,
    color: colors.textFaint,
  },
  valueRow: { alignItems: 'flex-end', minWidth: 70 },
  progressValue: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.bold,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  editBtn: { padding: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decimalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: fontSizes.bodyLg,
    textAlign: 'center',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  cancelEditBtn: { padding: 6 },
  sectionTitle: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  chartCaption: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chartBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 4,
    overflow: 'hidden',
  },
  emptyChart: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 32,
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: fontSizes.body - 1,
    color: colors.textFaint,
  },
  questChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  iconBoxSm: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questChartName: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
});
