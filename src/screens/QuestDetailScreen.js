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
} from '../utils/helpers';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

const CHART_TABS = ['week', 'month', 'quarter'];

export default function QuestDetailScreen({ route, navigation }) {
  const { questId } = route.params;
  const { quests, checkinHistory, addGoal, toggleGoal, deleteGoal, toastMessage } =
    useApp();
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

  // Prepare data for react-native-chart-kit
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

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    addGoal(questId, newGoalText.trim());
    setNewGoalText('');
    setShowNewGoal(false);
  };

  return (
    <View style={styles.wrapper}>
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

        {/* Weekly bar chart */}
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

        {/* Goals */}
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
  wrapper: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { paddingTop: spacing.lg, paddingBottom: 32 },
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
