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
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';
import {
  getToday,
  getStreakInfo,
  addDays,
  formatDateFull,
} from '../utils/helpers';
import {
  IMPORTANCE_LEVELS,
  DURATION_OPTIONS,
  QUEST_ICONS,
  QUEST_COLORS,
} from '../utils/constants';
import { colors, radii, fontSizes, fontWeights, spacing } from '../utils/theme';

export default function GoalsScreen() {
  const {
    quests,
    checkinHistory,
    permanentDeleteQuest,
    addQuest,
    deleteGoal,
    toastMessage,
  } = useApp();
  const today = getToday();

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showNewQuest, setShowNewQuest] = useState(false);
  const [nq, setNq] = useState({
    name: '',
    icon: 'code',
    color: '#534AB7',
    importance: 1,
    durationDays: 90,
  });

  const handleAddQuest = () => {
    if (!nq.name.trim()) return;
    addQuest({
      name: nq.name.trim(),
      icon: nq.icon,
      color: nq.color,
      importance: nq.importance,
      durationDays: nq.durationDays,
    });
    setShowNewQuest(false);
    setNq({
      name: '',
      icon: 'code',
      color: '#534AB7',
      importance: 1,
      durationDays: 90,
    });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Quest manager</Text>
        <Text style={styles.subtitle}>
          Create, configure, and permanently delete quests here. Daily check-ins
          can only be toggled from the Today tab.
        </Text>

        {quests.map((q) => {
          const info = getStreakInfo(checkinHistory[q.id] || [], today);
          const imp = IMPORTANCE_LEVELS.find((l) => l.value === q.importance);
          const dur = DURATION_OPTIONS.find((d) => d.value === q.durationDays);
          const endDate =
            q.durationDays > 0 ? addDays(q.startDate, q.durationDays) : null;

          return (
            <View key={q.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: q.color + '14' },
                  ]}
                >
                  <Feather name={q.icon} size={18} color={q.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.questName}>{q.name}</Text>
                  <Text style={styles.questSub}>
                    {info.total} total check-ins
                  </Text>
                </View>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Importance</Text>
                  <Text style={[styles.detailValue, { color: imp.color, fontWeight: fontWeights.semibold }]}>
                    {imp.label} ({q.importance}x XP)
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>
                    {dur?.label || 'Ongoing'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Started</Text>
                  <Text style={styles.detailValue}>
                    {formatDateFull(q.startDate)}
                  </Text>
                </View>
                {endDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ends</Text>
                    <Text style={styles.detailValue}>
                      {formatDateFull(endDate)}
                    </Text>
                  </View>
                )}
              </View>

              {q.goals.length > 0 && (
                <View style={styles.goalsPreview}>
                  <Text style={styles.goalsPreviewTitle}>
                    Goals ({q.goals.filter((g) => g.done).length}/
                    {q.goals.length} done)
                  </Text>
                  {q.goals.map((g) => (
                    <View key={g.id} style={styles.goalRow}>
                      <Feather
                        name={g.done ? 'check-circle' : 'clock'}
                        size={14}
                        color={g.done ? colors.success : colors.warning}
                      />
                      <Text
                        style={[
                          styles.goalText,
                          g.done && {
                            textDecorationLine: 'line-through',
                            color: '#999',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {g.text}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteGoal(q.id, g.id)}
                        style={{ padding: 2 }}
                      >
                        <Feather name="trash-2" size={13} color="#ddd" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {confirmDelete === q.id ? (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmText}>
                    This permanently deletes "{q.name}" and all its history.
                    Earned XP will be removed.
                  </Text>
                  <View style={styles.confirmActions}>
                    <TouchableOpacity
                      onPress={() => {
                        permanentDeleteQuest(q.id);
                        setConfirmDelete(null);
                      }}
                      style={styles.deleteConfirmBtn}
                    >
                      <Text style={styles.deleteConfirmText}>
                        Delete forever
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setConfirmDelete(null)}
                      style={styles.keepBtn}
                    >
                      <Text style={styles.keepBtnText}>Keep it</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setConfirmDelete(q.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>
                    Delete quest permanently
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* New quest form */}
        {showNewQuest ? (
          <View style={styles.newQuestForm}>
            <Text style={styles.formTitle}>New quest</Text>

            <TextInput
              value={nq.name}
              onChangeText={(t) => setNq({ ...nq, name: t })}
              placeholder="Quest name"
              style={styles.nameInput}
              placeholderTextColor="#bbb"
            />

            <Text style={styles.fieldLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {QUEST_ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic.icon}
                  onPress={() => setNq({ ...nq, icon: ic.icon })}
                  style={[
                    styles.iconOption,
                    nq.icon === ic.icon && {
                      borderColor: nq.color,
                      borderWidth: 2,
                      backgroundColor: nq.color + '10',
                    },
                  ]}
                >
                  <Feather
                    name={ic.icon}
                    size={18}
                    color={nq.icon === ic.icon ? nq.color : '#888'}
                  />
                  <Text style={styles.iconLabel}>{ic.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {QUEST_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNq({ ...nq, color: c })}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    nq.color === c && styles.colorDotActive,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>Importance (XP multiplier)</Text>
            <View style={styles.impRow}>
              {IMPORTANCE_LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.value}
                  onPress={() => setNq({ ...nq, importance: l.value })}
                  style={[
                    styles.impOption,
                    nq.importance === l.value && {
                      borderColor: l.color,
                      borderWidth: 2,
                      backgroundColor: l.color + '10',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.impValue,
                      { color: l.color },
                    ]}
                  >
                    {l.value}x
                  </Text>
                  <Text style={styles.impLabel}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Duration</Text>
            <View style={styles.durGrid}>
              {DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setNq({ ...nq, durationDays: d.value })}
                  style={[
                    styles.durOption,
                    nq.durationDays === d.value && styles.durActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.durText,
                      nq.durationDays === d.value && styles.durTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={handleAddQuest}
                style={styles.createBtn}
              >
                <Text style={styles.createBtnText}>Create quest</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowNewQuest(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowNewQuest(true)}
            style={styles.addQuestBtn}
          >
            <Feather name="plus" size={16} color={colors.textMuted} />
            <Text style={styles.addQuestText}>Create new quest</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Toast message={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 32 },
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
    lineHeight: 20,
  },
  questCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questName: {
    fontSize: fontSizes.bodyLg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  questSub: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  detailGrid: { marginBottom: spacing.md },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: fontSizes.body - 1,
    color: '#999',
  },
  detailValue: {
    fontSize: fontSizes.body - 1,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  goalsPreview: { marginBottom: spacing.md },
  goalsPreviewTitle: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
    color: '#999',
    marginBottom: 4,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  goalText: {
    flex: 1,
    fontSize: fontSizes.body - 1,
    color: colors.textSecondary,
  },
  confirmBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: fontSizes.body - 1,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 6,
  },
  deleteConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.danger,
  },
  deleteConfirmText: {
    color: colors.white,
    fontSize: fontSizes.body - 1,
    fontWeight: fontWeights.semibold,
  },
  keepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: colors.white,
  },
  keepBtnText: {
    color: colors.textSecondary,
    fontSize: fontSizes.body - 1,
  },
  deleteBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e0e0',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: fontSizes.caption,
    opacity: 0.6,
  },
  newQuestForm: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D5D5D5',
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.md,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: fontSizes.body,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
    marginBottom: 6,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  iconOption: {
    width: '15.5%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    gap: 2,
  },
  iconLabel: { fontSize: 9, color: '#aaa' },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#333',
    borderWidth: 3,
  },
  impRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  impOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  impValue: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  impLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  durGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.lg,
  },
  durOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  durActive: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.accentLight,
  },
  durText: {
    fontSize: fontSizes.body - 1,
    color: colors.textSecondary,
  },
  durTextActive: {
    color: colors.accent,
    fontWeight: fontWeights.semibold,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  createBtn: {
    flex: 1,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  createBtnText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: fontSizes.body,
  },
  addQuestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D5D5D5',
  },
  addQuestText: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
});
