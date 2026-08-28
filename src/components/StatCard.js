import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, fontSizes, fontWeights } from '../utils/theme';

export default function StatCard({ value, label, color }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: color || colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  value: {
    fontSize: fontSizes.stat,
    fontWeight: fontWeights.bold,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 1,
  },
});
