import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={InputDefaults.placeholderTextColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
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
  inputError: { borderColor: SEMANTIC.red },
  error: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: SEMANTIC.red,
  },
});
