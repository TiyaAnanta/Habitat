import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import XPHeader from '../components/XPHeader';
import QuestCard from '../components/QuestCard';
import Toast from '../components/Toast';
import { colors, fontSizes, fontWeights, spacing, radii } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const { quests, loaded, toastMessage } = useApp();

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>Habitat</Text>
          <Text style={styles.tagline}>build your daily habits</Text>
        </View>

        <XPHeader />

        <Text style={styles.sectionTitle}>Daily quests</Text>

        {quests.map((q) => (
          <QuestCard
            key={q.id}
            quest={q}
            onPress={() =>
              navigation.navigate('Analytics', {
                screen: 'QuestDetail',
                params: { questId: q.id },
              })
            }
          />
        ))}

        <View style={styles.xpInfo}>
          <Text style={styles.xpInfoTitle}>How XP works</Text>
          <View style={styles.xpGrid}>
            {[
              ['Days 1–6', '5 × weight'],
              ['Days 7–13', '10 × weight'],
              ['Days 14–29', '15 × weight'],
              ['Days 30+', '25 × weight'],
              ['All quests bonus', '+10 flat'],
            ].map(([left, right]) => (
              <View key={left} style={styles.xpRow}>
                <Text style={styles.xpLabel}>{left}</Text>
                <Text style={styles.xpValue}>{right}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <Toast message={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 32 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.lg },
  appName: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSizes.sm,
    color: colors.textFaint,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  xpInfo: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
  },
  xpInfoTitle: {
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    fontSize: fontSizes.caption,
    marginBottom: spacing.sm,
  },
  xpGrid: { gap: 2 },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  xpLabel: { fontSize: fontSizes.caption, color: colors.textMuted },
  xpValue: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
