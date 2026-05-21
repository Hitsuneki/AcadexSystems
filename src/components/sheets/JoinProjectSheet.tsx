import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { AcadexBottomSheet } from '../AcadexBottomSheet';
import { FormInput } from '../FormInput';
import { ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateInviteCode } from '@/utils/validation';
import { joinProjectByCode } from '@/services/project.service';
import { Text } from 'react-native';
import type { Project } from '@/types';

interface JoinProjectSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onJoined: (project: Project) => void;
}

export function JoinProjectSheet({ visible, onClose, userId, onJoined }: JoinProjectSheetProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    const err = validateInviteCode(code);
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    try {
      const project = await joinProjectByCode(userId, code.trim().toUpperCase());
      onJoined(project);
      onClose();
      setCode('');
      Toast.show({ type: 'success', text1: `Joined ${project.name}!` });
    } catch {
      Toast.show({ type: 'error', text1: 'Invalid invite code' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AcadexBottomSheet visible={visible} onClose={onClose} title="Join a project" snapPoints={['45%']}>
      <View style={styles.form}>
        <FormInput
          label="Invite code"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          autoCapitalize="characters"
          error={error}
          style={styles.codeInput}
        />
        <Pressable onPress={handleJoin} disabled={loading} style={[styles.btn, loading && styles.btnDisabled]}>
          {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>Join</Text>}
        </Pressable>
      </View>
    </AcadexBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16, paddingTop: 16 },
  codeInput: { textAlign: 'center', fontSize: 22, letterSpacing: 8, fontFamily: FontFamily.soraSemiBold },
  btn: { backgroundColor: ACCENT.blue, borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
});
