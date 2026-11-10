import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Simple dropdown: a button that opens a list of options in a modal.
// options: array of { label, value }
export default function Dropdown({ options, value, onChange, style, placeholder }) {
  const [open, setOpen] = useState(false);
  const found = options.find((o) => o.value === value);
  const selected = found || (placeholder ? null : options[0]);

  return (
    <View style={[{ flex: 1 }, style]}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.buttonText, !selected && styles.placeholder]} numberOfLines={1}>{selected ? selected.label : placeholder}</Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <ScrollView>
            {options.map((o) => {
              const on = o.value === value;
              return (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.option, on && styles.optionOn]}
                  onPress={() => { onChange(o.value); setOpen(false); }}
                >
                  <Text style={[styles.optionText, on && styles.optionTextOn]}>{o.label}</Text>
                  {on && <Text style={styles.optionTextOn}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ecd0d0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 11 },
  buttonText: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '600' },
  placeholder: { color: colors.muted, fontWeight: '400' },
  arrow: { color: colors.muted, marginLeft: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 32 },
  sheet: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 6, overflow: 'hidden', maxHeight: '75%' },
  option: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18 },
  optionOn: { backgroundColor: '#fde8e8' },
  optionText: { fontSize: 15, color: colors.text },
  optionTextOn: { color: colors.primary, fontWeight: '700' },
});
