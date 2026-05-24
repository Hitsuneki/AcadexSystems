import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { TEXT, SEMANTIC, ACCENT } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  success?: boolean;
}

export function FormInput({ label, error, success, style, ...props }: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          success && styles.inputSuccess,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={InputDefaults.placeholderTextColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
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
  input: {
    backgroundColor: InputDefaults.backgroundColor,
    borderRadius: InputDefaults.borderRadius,
    borderWidth: InputDefaults.borderWidth,
    borderColor: InputDefaults.borderColor,
    color: InputDefaults.color,
    padding: InputDefaults.padding,
    fontSize: InputDefaults.fontSize,
    fontFamily: FontFamily.interRegular,
    minHeight: 44,
  },
  inputFocused: { borderColor: InputDefaults.focusedBorderColor },
  inputSuccess: { borderColor: ACCENT.primary },
  inputError: { borderColor: SEMANTIC.red },
  error: {
    marginTop: 6,
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: SEMANTIC.red,
  },
});
