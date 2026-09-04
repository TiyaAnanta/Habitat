import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import XPHeader from '../components/XPHeader';
import QuestCard from '../components/QuestCard';
import Toast from '../components/Toast';
import { colors, fontSizes, fontWeights, spacing, radii } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

export default function HomeScreen({ navigation }) {
  const { quests, loaded, toastMessage } = useApp();
  const { wrapperStyle, contentStyle, contentWidth } = useScreenLayout();
  const [xpOpen, setXpOpen] = useState(false);
  const xpAnim = useRef(new Animated.Value(0)).current;

  const toggleXp = () => {
    Animated.timing(xpAnim, {
      toValue: xpOpen ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setXpOpen(!xpOpen);
  };

  const xpHeight = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 140] });
  const xpRotate = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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

        <TouchableOpacity
          onPress={toggleXp}
          activeOpacity={0.7}
          style={styles.xpInfo}
        >
          <View style={styles.xpInfoHeader}>
            <Text style={styles.xpInfoTitle}>How XP works</Text>
            <Animated.View style={{ transform: [{ rotate: xpRotate }] }}>
              <Feather name="chevron-down" size={16} color={colors.textMuted} />
            </Animated.View>
          </View>
          <Animated.View style={{ height: xpHeight, overflow: 'hidden' }}>
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
          </Animated.View>
        </TouchableOpacity>
      </ScrollView>
      <Toast message={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { paddingTop: spacing.lg, paddingBottom: 32 },
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
  xpInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpInfoTitle: {
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    fontSize: fontSizes.caption,
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
