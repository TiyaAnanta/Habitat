import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getToday, getStreakInfo, daysBetween, addDays } from '../utils/helpers';
import { IMPORTANCE_LEVELS } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';

export default function QuestCard({ quest, onPress }) {
  const { checkinHistory, checkin, uncheckin, logs, setQuestLog } = useApp();
  const today = getToday();
  const info = getStreakInfo(checkinHistory[quest.id] || [], today);
  const danger = !info.checkedToday && info.current >= 3;
  const impLabel = IMPORTANCE_LEVELS.find((l) => l.value === quest.importance);
  const endDate =
    quest.durationDays > 0 ? addDays(quest.startDate, quest.durationDays) : null;
  const daysLeft = endDate ? Math.max(0, daysBetween(today, endDate)) : null;

  const savedNote = (logs[quest.id] || {})[today] || '';
  const [note, setNote] = useState(savedNote);

  // Keep the field in step when the note changes elsewhere (reset, reload).
  useEffect(() => {
    setNote(savedNote);
  }, [savedNote]);

  // Persist on blur rather than per keystroke, to avoid a disk write per letter.
  const commitNote = () => {
    if (note !== savedNote) setQuestLog(quest.id, note);
  };

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
      <View
        style={[
          styles.card,
          danger && styles.cardDanger,
          info.checkedToday && styles.cardDone,
        ]}
      >
        <View style={styles.row}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.rowMain}
          >
            <View
              style={[styles.iconBox, { backgroundColor: quest.color + '14' }]}
            >
              <Feather name={quest.icon} size={20} color={quest.color} />
            </View>

            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {quest.name}
                </Text>
                {quest.importance > 1 && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: impLabel.color + '18' },
                    ]}
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
          </TouchableOpacity>

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
        </View>

        <View style={styles.noteSection}>
          <Feather
            name="edit-3"
            size={13}
            color={note ? quest.color : colors.textFaint}
            style={styles.noteIcon}
          />
          <TextInput
            value={note}
            onChangeText={setNote}
            onBlur={commitNote}
            onSubmitEditing={commitNote}
            blurOnSubmit
            placeholder="What did you do today?"
            placeholderTextColor={colors.textFaint}
            style={styles.noteInput}
            multiline
            returnKeyType="done"
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  noteIcon: {
    marginTop: 3,
  },
  noteInput: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    padding: 0,
    minHeight: 18,
  },
});
