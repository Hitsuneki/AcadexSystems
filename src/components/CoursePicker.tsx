import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { COURSE_GROUPS, isKnownCourse } from '@/constants/courses';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

interface CoursePickerProps {
  label?: string;
  value: string;
  onChange: (course: string) => void;
  error?: string | null;
  /** When editing, show saved value even if not in the catalog */
  includeCustomValue?: boolean;
}

export function CoursePicker({
  label = 'Course / Program',
  value,
  onChange,
  error,
  includeCustomValue = false,
}: CoursePickerProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(!value);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COURSE_GROUPS;

    return COURSE_GROUPS.map((group) => ({
      ...group,
      programs: group.programs.filter((p) => p.toLowerCase().includes(q)),
    })).filter((g) => g.programs.length > 0);
  }, [search]);

  const showCustomOnly = includeCustomValue && value && !isKnownCourse(value);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={[styles.trigger, error ? styles.triggerError : null, value ? styles.triggerSelected : null]}>
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]} numberOfLines={2}>
          {value || 'Select your course or program'}
        </Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.panel}>
          <TextInput
            style={styles.search}
            placeholder="Search programs..."
            placeholderTextColor={InputDefaults.placeholderTextColor}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            style={styles.list}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator>
            {showCustomOnly && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Your current program</Text>
                <Pressable
                  onPress={() => {
                    onChange(value);
                    setExpanded(false);
                    setSearch('');
                  }}
                  style={[styles.option, value && styles.optionActive]}>
                  <Text style={[styles.optionText, value && styles.optionTextActive]}>{value}</Text>
                </Pressable>
              </View>
            )}
            {filteredGroups.map((group) => (
              <View key={group.id} style={styles.group}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                {group.programs.map((program) => {
                  const selected = value === program;
                  return (
                    <Pressable
                      key={program}
                      onPress={() => {
                        onChange(program);
                        setExpanded(false);
                        setSearch('');
                      }}
                      style={[styles.option, selected && styles.optionActive]}>
                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{program}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
            {filteredGroups.length === 0 && (
              <Text style={styles.empty}>No programs match &quot;{search}&quot;</Text>
            )}
          </ScrollView>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interMedium,
    color: TEXT.secondary,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: InputDefaults.backgroundColor,
    borderRadius: InputDefaults.borderRadius,
    borderWidth: InputDefaults.borderWidth,
    borderColor: InputDefaults.borderColor,
    paddingHorizontal: InputDefaults.padding,
    paddingVertical: 12,
    minHeight: 44,
  },
  triggerSelected: { borderColor: ACCENT.blueBorder },
  triggerError: { borderColor: SEMANTIC.red },
  triggerText: {
    flex: 1,
    fontSize: InputDefaults.fontSize,
    fontFamily: FontFamily.interRegular,
    color: TEXT.primary,
  },
  triggerPlaceholder: { color: TEXT.muted },
  chevron: {
    fontSize: FontSize.xs,
    color: TEXT.muted,
  },
  panel: {
    borderRadius: InputDefaults.borderRadius,
    borderWidth: InputDefaults.borderWidth,
    borderColor: BORDER.default,
    backgroundColor: BG.bg2,
    overflow: 'hidden',
  },
  search: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.primary,
  },
  list: { maxHeight: 280 },
  group: { paddingVertical: 8, paddingHorizontal: 10, gap: 4 },
  groupLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: ACCENT.blue,
    backgroundColor: ACCENT.blueDim,
  },
  optionText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
  optionTextActive: {
    fontFamily: FontFamily.interMedium,
    color: ACCENT.blue,
  },
  empty: {
    padding: 16,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
    textAlign: 'center',
  },
  error: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: SEMANTIC.red,
  },
});
