import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatDateFull } from '../utils/helpers';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';

export default function GoalItem({ goal, questColor, onToggle, onDelete, showDelete }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.checkbox,
          goal.done
            ? { backgroundColor: questColor, borderWidth: 0 }
            : { borderColor: '#ccc' },
        ]}
      >
        {goal.done && <Feather name="check" size={14} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            goal.done && { textDecorationLine: 'line-through', color: '#aaa' },
          ]}
        >
          {goal.text}
        </Text>
        <Text style={styles.date}>Added {formatDateFull(goal.createdAt)}</Text>
      </View>

      {showDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={14} color="#ddd" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0ee',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.textFaint,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
});
