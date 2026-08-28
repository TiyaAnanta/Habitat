import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTitle, getNextTitle, getToday } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import { radii, fontSizes, fontWeights, spacing } from '../utils/theme';

export default function XPHeader() {
  const { xp, quests, checkinHistory } = useApp();
  const today = getToday();
  const title = getTitle(xp);
  const nextTitle = getNextTitle(xp);
  const progress = nextTitle
    ? ((xp - title.min) / (nextTitle.min - title.min)) * 100
    : 100;
  const completedToday = quests.filter(
    (q) => (checkinHistory[q.id] || []).includes(today)
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.titleLabel}>{title.title}</Text>
          <Text style={styles.xpValue}>
            {title.icon} {Math.round(xp)} XP
          </Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.doneCount}>
            {completedToday}/{quests.length}
          </Text>
          <Text style={styles.doneLabel}>done today</Text>
        </View>
      </View>

      {nextTitle && (
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{title.title}</Text>
            <Text style={styles.progressLabel}>
              {nextTitle.title} — {nextTitle.min} XP
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(Math.round(progress), 100)}%` },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: '#1a1340',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLabel: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpValue: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.bold,
    color: '#fff',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  doneCount: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.bold,
    color: '#fff',
  },
  doneLabel: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.45)',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.pill,
    height: 5,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#a78bfa',
    height: '100%',
    borderRadius: radii.pill,
  },
});
