import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getToday, getStreakInfo, daysBetween, addDays } from '../utils/helpers';
import { IMPORTANCE_LEVELS } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';

export default function QuestCard({ quest, onPress }) {
  const { checkinHistory, checkin, uncheckin } = useApp();
  const today = getToday();
  const info = getStreakInfo(checkinHistory[quest.id] || [], today);
  const danger = !info.checkedToday && info.current >= 3;
  const impLabel = IMPORTANCE_LEVELS.find((l) => l.value === quest.importance);
  const endDate =
    quest.durationDays > 0 ? addDays(quest.startDate, quest.durationDays) : null;
  const daysLeft = endDate ? Math.max(0, daysBetween(today, endDate)) : null;

  const scale = useRef(new Animated.Value(1)).current;

  const handleCheckin = () => {
    if (info.checkedToday) {
      uncheckin(quest.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      checkin(quest.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.04,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.card,
          danger && styles.cardDanger,
          info.checkedToday && styles.cardDone,
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: quest.color + '14' }]}>
          <Feather name={quest.icon} size={20} color={quest.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {quest.name}
            </Text>
            {quest.importance > 1 && (
              <View
                style={[styles.badge, { backgroundColor: impLabel.color + '18' }]}
              >
                <Text style={[styles.badgeText, { color: impLabel.color }]}>
                  {quest.importance}x
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {info.current > 0 ? (
              <>
                {info.current >= 7 ? '🔥 ' : ''}
                {info.current}d streak
                {danger ? " — don't break it!" : ''}
              </>
            ) : info.total > 0 ? (
              'Streak lost — start again'
            ) : (
              'Not started yet'
            )}
            {daysLeft != null && daysLeft <= 30 && (
              <Text style={{ color: colors.warning }}> • {daysLeft}d left</Text>
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCheckin}
          style={[
            styles.checkBtn,
            info.checkedToday
              ? { backgroundColor: quest.color, borderWidth: 0 }
              : { borderColor: quest.color + '35' },
          ]}
        >
          <Feather
            name={info.checkedToday ? 'check' : 'zap'}
            size={18}
            color={info.checkedToday ? '#fff' : quest.color}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  cardDanger: {
    borderColor: colors.dangerLight,
    borderWidth: 1.5,
    backgroundColor: '#FFF5F5',
  },
  cardDone: {
    backgroundColor: colors.successBg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
