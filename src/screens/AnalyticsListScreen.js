import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getToday, getStreakInfo } from '../utils/helpers';
import Toast from '../components/Toast';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

export default function AnalyticsListScreen({ navigation }) {
  const { quests, checkinHistory, toastMessage } = useApp();
  const { wrapperStyle, contentStyle, contentWidth } = useScreenLayout();
  const today = getToday();

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>
          Tap a quest to see its progress graphs and goals.
        </Text>

        {quests.map((q) => {
          const info = getStreakInfo(checkinHistory[q.id] || [], today);
          return (
            <TouchableOpacity
              key={q.id}
              onPress={() =>
                navigation.navigate('QuestDetail', { questId: q.id })
              }
              activeOpacity={0.7}
              style={styles.card}
            >
              <View
                style={[styles.iconBox, { backgroundColor: q.color + '14' }]}
              >
                <Feather name={q.icon} size={18} color={q.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{q.name}</Text>
                <Text style={styles.cardSub}>
                  {info.current}d streak — {info.total} total check-ins
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
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
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  cardName: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
});
