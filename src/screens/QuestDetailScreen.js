import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import GoalItem from '../components/GoalItem';
import Toast from '../components/Toast';
import {
  getToday,
  getStreakInfo,
  daysBetween,
  addDays,
  formatDateFull,
  getChartData,
  getWeeklyData,
  getWeekKey,
  getMonthKey,
  formatWeekRange,
  formatMonth,
} from '../utils/helpers';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

const CHART_TABS = ['week', 'month', 'quarter'];

export default function QuestDetailScreen({ route, navigation }) {
  const { questId } = route.params;
  const {
    quests,
    checkinHistory,
    weeklyProgress,
    monthlyGoals,
    addGoal,
    toggleGoal,
    deleteGoal,
    toastMessage,
  } = useApp();
  const { wrapperStyle, contentStyle, contentWidth } = useScreenLayout();
  const chartWidth = contentWidth - 8;
  const [activeTab, setActiveTab] = useState('week');
  const [newGoalText, setNewGoalText] = useState('');
  const [showNewGoal, setShowNewGoal] = useState(false);

  const quest = quests.find((q) => q.id === questId);
  if (!quest) {
    return (
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={{ padding: 20, color: colors.textMuted }}>
          Quest not found.
        </Text>
      </View>
    );
  }

  const today = getToday();
  const info = getStreakInfo(checkinHistory[questId] || [], today);
  const endDate =
    quest.durationDays > 0 ? addDays(quest.startDate, quest.durationDays) : null;
  const daysLeft = endDate ? Math.max(0, daysBetween(today, endDate)) : null;
  const daysElapsed = Math.max(0, daysBetween(quest.startDate, today));
  const durationProgress =
    quest.durationDays > 0
      ? Math.min(100, Math.round((daysElapsed / quest.durationDays) * 100))
      : null;
  const consistency =
    info.total > 0 && daysElapsed > 0
      ? Math.min(100, Math.round((info.total / Math.max(1, daysElapsed)) * 100))
      : 0;

  const chartData = getChartData(checkinHistory[questId] || [], today, activeTab);
  const weeklyData = getWeeklyData(checkinHistory[questId] || [], today);

  const streakValues = chartData.map((d) => d.streak);
  const streakLabels = chartData.filter((_, i) => {
    const interval = activeTab === 'week' ? 1 : activeTab === 'month' ? 7 : 15;
    return i % interval === 0;
  }).map((d) => d.date);

  const weeklyValues = weeklyData.map((d) => d.days);
  const weeklyLabels = weeklyData
    .filter((_, i) => i % 3 === 0)
    .map((d) => d.week);

  const chartConfig = {
    backgroundGradientFrom: '#f9f9f8',
    backgroundGradientTo: '#f9f9f8',
    color: () => quest.color,
    fillShadowGradientFrom: quest.color,
    fillShadowGradientTo: quest.color,
    fillShadowGradientFromOpacity: 0.3,
    fillShadowGradientToOpacity: 0.02,
    labelColor: () => '#aaa',
    propsForLabels: { fontSize: 10 },
    decimalPlaces: 0,
    propsForBackgroundLines: { stroke: '#eee' },
  };

  // Weekly progress for this quest (last 8 weeks)
  const currentWeekKey = getWeekKey(today);
  const weeklyProgressData = useMemo(() => {
    const labels = [];
    const data = [];
    for (let i = 7; i >= 0; i--) {
      const wk = addDays(currentWeekKey, -i * 7);
      const wd = weeklyProgress[wk] || {};
      const d = new Date(wk + 'T00:00:00');
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      data.push(wd[questId] || 0);
    }
    return { labels, data };
  }, [weeklyProgress, questId, currentWeekKey]);

  const currentWeekVal = (weeklyProgress[currentWeekKey] || {})[questId];

  // Monthly goals for this quest
  const currentMonthKey = getMonthKey(today);
  const currentMonthGoals = (monthlyGoals[currentMonthKey] || {})[questId] || [];
  const monthlyDone = currentMonthGoals.filter((g) => g.done).length;
  const monthlyTotal = currentMonthGoals.length;
  const monthlyPct = monthlyTotal > 0 ? Math.round((monthlyDone / monthlyTotal) * 100) : 0;

  // Last 6 months completion
  const monthlyHistoryData = useMemo(() => {
    const labels = [];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const [y, m] = currentMonthKey.split('-').map(Number);
      const total = y * 12 + (m - 1) - i;
      const ny = Math.floor(total / 12);
      const nm = (total % 12) + 1;
      const mk = `${ny}-${String(nm).padStart(2, '0')}`;
      const goals = (monthlyGoals[mk] || {})[questId] || [];
      const done = goals.filter((g) => g.done).length;
      const pct = goals.length > 0 ? Math.round((done / goals.length) * 100) : 0;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      labels.push(months[nm - 1]);
      data.push(pct);
    }
    return { labels, data };
  }, [monthlyGoals, questId, currentMonthKey]);

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    addGoal(questId, newGoalText.trim());
    setNewGoalText('');
    setShowNewGoal(false);
  };

  const getProgressColor = (val) => {
    if (val > 1) return '#059669';
    if (val === 1) return colors.accent;
    if (val >= 0.5) return '#D97706';
    return '#DC2626';
  };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {/* Fixed back button with glass background */}
      <View style={styles.backBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quest header */}
        <View style={styles.questHeader}>
          <View
            style={[styles.iconBox, { backgroundColor: quest.color + '14' }]}
          >
            <Feather name={quest.icon} size={24} color={quest.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.questName}>{quest.name}</Text>
            <Text style={styles.questDates}>
              {quest.durationDays > 0
                ? `${formatDateFull(quest.startDate)} — ${formatDateFull(endDate)}`
                : 'Ongoing quest'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            value={info.current}
            label="Current"
            color={info.current >= 7 ? '#D97706' : quest.color}
          />
          <StatCard value={info.longest} label="Best" color={quest.color} />
          <StatCard
            value={`${consistency}%`}
            label="Consistency"
            color={consistency >= 80 ? '#059669' : colors.textMuted}
          />
        </View>

        {/* Duration progress */}
        {durationProgress != null && (
          <View style={styles.durationSection}>
            <View style={styles.durationLabels}>
              <Text style={styles.durationLabel}>Goal timeline</Text>
              <Text style={styles.durationLabel}>{daysLeft}d remaining</Text>
            </View>
            <View style={styles.durationTrack}>
              <View
                style={[
                  styles.durationFill,
                  {
                    width: `${durationProgress}%`,
                    backgroundColor: quest.color,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* === DAILY SECTION === */}
        <View style={styles.sectionDivider}>
          <Feather name="sun" size={14} color={colors.textMuted} />
          <Text style={styles.sectionLabel}>Daily</Text>
        </View>

        {/* Streak chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Streak history</Text>
            <View style={styles.tabs}>
              {CHART_TABS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveTab(t)}
                  style={[
                    styles.tab,
                    activeTab === t ? styles.tabActive : styles.tabInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === t
                        ? styles.tabTextActive
                        : styles.tabTextInactive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chartBox}>
            <LineChart
              data={{
                labels: streakLabels,
                datasets: [{ data: streakValues.length ? streakValues : [0] }],
              }}
              width={chartWidth}
              height={160}
              chartConfig={chartConfig}
              bezier
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              style={{ borderRadius: radii.md }}
            />
          </View>
        </View>

        {/* Weekly check-ins bar */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Weekly check-ins</Text>
          <View style={styles.chartBox}>
            <BarChart
              data={{
                labels: weeklyLabels,
                datasets: [{ data: weeklyValues.length ? weeklyValues : [0] }],
              }}
              width={chartWidth}
              height={130}
              chartConfig={chartConfig}
              withInnerLines={false}
              showValuesOnTopOfBars={false}
              fromZero
              style={{ borderRadius: radii.md }}
            />
          </View>
        </View>

        {/* === WEEKLY SECTION === */}
        <View style={styles.sectionDivider}>
          <Feather name="calendar" size={14} color={colors.textMuted} />
          <Text style={styles.sectionLabel}>Weekly progress</Text>
        </View>

        {/* Current week snapshot */}
        <View style={styles.weeklyCard}>
          <View style={styles.weeklyCardHeader}>
            <Text style={styles.weeklyCardTitle}>{formatWeekRange(currentWeekKey)}</Text>
            {currentWeekVal != null && (
              <Text
                style={[
                  styles.weeklyCardValue,
                  { color: getProgressColor(currentWeekVal) },
                ]}
              >
                {currentWeekVal.toFixed(2)}
              </Text>
            )}
          </View>
          {currentWeekVal != null ? (
            <View>
              <View style={styles.weeklyBarTrack}>
                <View
                  style={[
                    styles.weeklyBarFill,
                    {
                      width: `${Math.min(currentWeekVal, 1.5) / 1.5 * 100}%`,
                      backgroundColor: getProgressColor(currentWeekVal),
                    },
                  ]}
                />
                <View style={styles.weeklyMarker} />
              </View>
              <Text style={styles.weeklyBarLabel}>
                {currentWeekVal > 1 ? 'Overachieved!' : currentWeekVal === 1 ? 'Complete' : `${Math.round(currentWeekVal * 100)}% done`}
              </Text>
            </View>
          ) : (
            <Text style={styles.weeklyEmpty}>No progress logged this week</Text>
          )}
        </View>

        {/* 8-week trend */}
        {weeklyProgressData.data.some((d) => d > 0) && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>8-week trend</Text>
            <View style={styles.chartBox}>
              <BarChart
                data={{
                  labels: weeklyProgressData.labels.filter((_, i) => i % 2 === 0),
                  datasets: [{ data: weeklyProgressData.data }],
                }}
                width={chartWidth}
                height={140}
                chartConfig={{
                  ...chartConfig,
                  decimalPlaces: 1,
                  barPercentage: 0.6,
                }}
                fromZero
                showValuesOnTopOfBars
                withInnerLines={false}
                style={{ borderRadius: radii.md }}
              />
            </View>
          </View>
        )}

        {/* === MONTHLY SECTION === */}
        <View style={styles.sectionDivider}>
          <Feather name="layers" size={14} color={colors.textMuted} />
          <Text style={styles.sectionLabel}>Monthly goals</Text>
        </View>

        {/* Current month snapshot */}
        <View style={styles.monthlyCard}>
          <View style={styles.monthlyCardHeader}>
            <Text style={styles.monthlyCardTitle}>{formatMonth(currentMonthKey)}</Text>
            {monthlyTotal > 0 && (
              <Text
                style={[
                  styles.monthlyCardPct,
                  {
                    color:
                      monthlyPct === 100
                        ? '#059669'
                        : monthlyPct >= 50
                        ? '#D97706'
                        : colors.textMuted,
                  },
                ]}
              >
                {monthlyPct}%
              </Text>
            )}
          </View>
          {monthlyTotal > 0 ? (
            <View>
              <View style={styles.monthlyBarTrack}>
                <View
                  style={[
                    styles.monthlyBarFill,
                    {
                      width: `${monthlyPct}%`,
                      backgroundColor:
                        monthlyPct === 100
                          ? '#059669'
                          : monthlyPct >= 50
                          ? '#D97706'
                          : quest.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.monthlyBarLabel}>
                {monthlyDone}/{monthlyTotal} goals completed
              </Text>
              {currentMonthGoals.map((g) => (
                <View key={g.id} style={styles.monthlyGoalRow}>
                  <Feather
                    name={g.done ? 'check-circle' : 'circle'}
                    size={14}
                    color={g.done ? '#059669' : '#ccc'}
                  />
                  <Text
                    style={[
                      styles.monthlyGoalText,
                      g.done && styles.monthlyGoalDone,
                    ]}
                  >
                    {g.text}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.monthlyEmpty}>
              No monthly goals set — add them in the Monthly tab
            </Text>
          )}
        </View>

        {/* 6-month history */}
        {monthlyHistoryData.data.some((d) => d > 0) && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Monthly completion (6 months)</Text>
            <View style={styles.chartBox}>
              <BarChart
                data={{
                  labels: monthlyHistoryData.labels,
                  datasets: [{ data: monthlyHistoryData.data }],
                }}
                width={chartWidth}
                height={140}
                chartConfig={{
                  ...chartConfig,
                  color: () => '#059669',
                  fillShadowGradientFrom: '#059669',
                  fillShadowGradientTo: '#059669',
                  decimalPlaces: 0,
                  barPercentage: 0.6,
                }}
                fromZero
                showValuesOnTopOfBars
                withInnerLines={false}
                style={{ borderRadius: radii.md }}
              />
            </View>
          </View>
        )}

        {/* === GOALS SECTION === */}
        <View style={styles.sectionDivider}>
          <Feather name="target" size={14} color={colors.textMuted} />
          <Text style={styles.sectionLabel}>Quest goals</Text>
        </View>

        <View style={styles.goalsSection}>
          <View style={styles.goalsHeader}>
            <Text style={styles.chartTitle}>Goals</Text>
            <TouchableOpacity
              onPress={() => setShowNewGoal(!showNewGoal)}
              style={styles.addGoalBtn}
            >
              <Feather name="plus" size={14} color={colors.accent} />
              <Text style={styles.addGoalText}>Add</Text>
            </TouchableOpacity>
          </View>

          {showNewGoal && (
            <View style={styles.newGoalForm}>
              <TextInput
                value={newGoalText}
                onChangeText={setNewGoalText}
                placeholder="e.g. Complete C++ basics by end of this week"
                multiline
                style={styles.goalInput}
                placeholderTextColor="#bbb"
              />
              <View style={styles.newGoalActions}>
                <TouchableOpacity
                  onPress={handleAddGoal}
                  style={styles.saveGoalBtn}
                >
                  <Text style={styles.saveGoalText}>Save goal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowNewGoal(false);
                    setNewGoalText('');
                  }}
                  style={styles.cancelGoalBtn}
                >
                  <Text style={styles.cancelGoalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {quest.goals.length === 0 && !showNewGoal && (
            <Text style={styles.emptyGoals}>
              No goals yet. Add one to stay focused.
            </Text>
          )}

          {quest.goals.map((g) => (
            <GoalItem
              key={g.id}
              goal={g}
              questColor={quest.color}
              onToggle={() => toggleGoal(questId, g.id)}
              onDelete={() => deleteGoal(questId, g.id)}
              showDelete={false}
            />
          ))}
        </View>
      </ScrollView>
      <Toast message={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  container: { flex: 1 },
  content: { paddingTop: 52, paddingBottom: 32 },
  backBar: {
    ...Platform.select({
      web: { position: 'fixed' },
      default: { position: 'absolute' },
    }),
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(249, 249, 248, 0.78)',
    ...Platform.select({
      web: { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' },
      default: {},
    }),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  backText: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questName: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  questDates: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  durationSection: { marginBottom: spacing.lg },
  durationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  durationLabel: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  durationTrack: {
    backgroundColor: '#eee',
    borderRadius: radii.pill,
    height: 6,
    overflow: 'hidden',
  },
  durationFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sectionLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartSection: { marginBottom: spacing.xl },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  tabActive: { backgroundColor: colors.black },
  tabInactive: { backgroundColor: colors.surface },
  tabText: { fontSize: fontSizes.sm },
  tabTextActive: { color: colors.white, fontWeight: fontWeights.semibold },
  tabTextInactive: { color: colors.textMuted },
  chartBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 4,
    overflow: 'hidden',
  },

  // Weekly progress
  weeklyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  weeklyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weeklyCardTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  weeklyCardValue: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.bold,
  },
  weeklyBarTrack: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: radii.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  weeklyBarFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  weeklyMarker: {
    position: 'absolute',
    left: `${(1 / 1.5) * 100}%`,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  weeklyBarLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  weeklyEmpty: {
    fontSize: fontSizes.body - 1,
    color: colors.textFaint,
    fontStyle: 'italic',
  },

  // Monthly goals
  monthlyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  monthlyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monthlyCardTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  monthlyCardPct: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.bold,
  },
  monthlyBarTrack: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: 4,
  },
  monthlyBarFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  monthlyBarLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  monthlyGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  monthlyGoalText: {
    fontSize: fontSizes.body - 1,
    color: colors.textSecondary,
    flex: 1,
  },
  monthlyGoalDone: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  monthlyEmpty: {
    fontSize: fontSizes.body - 1,
    color: colors.textFaint,
    fontStyle: 'italic',
  },

  // Quest goals
  goalsSection: { marginTop: spacing.sm },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addGoalText: {
    fontSize: fontSizes.body - 1,
    fontWeight: fontWeights.semibold,
    color: colors.accent,
  },
  newGoalForm: { marginBottom: spacing.md },
  goalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: radii.md,
    padding: 12,
    fontSize: fontSizes.body,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  newGoalActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  saveGoalBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  saveGoalText: {
    color: colors.white,
    fontSize: fontSizes.body - 1,
    fontWeight: fontWeights.semibold,
  },
  cancelGoalBtn: {
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelGoalText: {
    color: colors.textMuted,
    fontSize: fontSizes.body - 1,
  },
  emptyGoals: {
    textAlign: 'center',
    padding: 20,
    color: colors.textFaint,
    fontSize: fontSizes.body - 1,
  },
});
