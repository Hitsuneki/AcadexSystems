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
  label = 'COURSE.FIELD',
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
            placeholder="SEARCH_PROGRAMS > _"
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
                <Text style={styles.groupLabel}>// YOUR CURRENT PROGRAM</Text>
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
                 <Text style={styles.groupLabel}>// {group.label.toUpperCase()}</Text>
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
              <Text style={styles.empty}>// NO.DATA.FOUND</Text>
            )}
          </ScrollView>
        </View>
      )}

      {error && <Text style={styles.error}>ERR: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    textTransform: 'uppercase',
    marginBottom: 6,
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
  triggerSelected: { borderColor: InputDefaults.borderColor },
  triggerError: { borderColor: SEMANTIC.red },
  triggerText: {
    flex: 1,
    fontSize: InputDefaults.fontSize,
    fontFamily: FontFamily.interRegular,
    color: InputDefaults.color,
  },
  triggerPlaceholder: { color: InputDefaults.placeholderTextColor },
  chevron: {
    fontSize: FontSize.monoSm,
    color: TEXT.t3,
  },
  panel: {
    borderRadius: InputDefaults.borderRadius,
    borderWidth: InputDefaults.borderWidth,
    borderColor: BORDER.dim,
    backgroundColor: BG.bg2,
    marginTop: 4,
    overflow: 'hidden',
  },
  search: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: FontSize.body,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t1,
  },
  list: { maxHeight: 280 },
  group: { paddingVertical: 8, gap: 4 },
  groupLabel: {
    fontSize: FontSize.label,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.bg2,
  },
  optionActive: {
    backgroundColor: BG.bg3,
  },
  optionText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.interRegular,
    color: TEXT.t2,
  },
  optionTextActive: {
    fontFamily: FontFamily.interMedium,
    color: ACCENT.primary,
  },
  empty: {
    padding: 16,
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    textAlign: 'center',
  },
  error: {
    marginTop: 6,
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: SEMANTIC.red,
  },
});
