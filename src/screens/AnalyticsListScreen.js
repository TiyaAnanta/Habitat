import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getToday, getStreakInfo } from '../utils/helpers';
import Toast from '../components/Toast';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';
import useScreenLayout from '../hooks/useScreenLayout';

function QuestRow({ quest, info, onPress, isExpanded }) {
  const rotation = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, isExpanded && styles.cardExpanded]}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: quest.color + '14' }]}>
          <Feather name={quest.icon} size={18} color={quest.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{quest.name}</Text>
          <Text style={styles.cardSub}>
            {info.current}d streak — {info.total} total check-ins
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Feather name="chevron-down" size={18} color="#ccc" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

export default function AnalyticsListScreen({ navigation }) {
  const { quests, checkinHistory, toastMessage } = useApp();
  const { wrapperStyle, contentStyle } = useScreenLayout();
  const today = getToday();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      navigation.navigate('QuestDetail', { questId: id });
    }
  };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>
          Tap a quest to see its daily, weekly, and monthly progress.
        </Text>

        {quests.map((q) => {
          const info = getStreakInfo(checkinHistory[q.id] || [], today);
          return (
            <QuestRow
              key={q.id}
              quest={q}
              info={info}
              isExpanded={expandedId === q.id}
              onPress={() => toggleExpand(q.id)}
            />
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
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardExpanded: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
