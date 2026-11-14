import React, { useCallback, useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput } from '../components/Themed';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getListings } from '../utils/storage';
import { notify } from '../utils/alert';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, logout, updateProfile } = useAuth();
  const [adCount, setAdCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      getListings().then((all) => setAdCount(all.filter((l) => user && l.ownerId === user.id).length));
    }, [user])
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Please login to see your profile</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Auth', {})}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startEdit = () => {
    setName(user.name);
    setPhone(user.phone || '');
    setPassword('');
    setEditing(true);
  };

  const save = async () => {
    if (!name.trim()) return notify('Enter your name');
    if (!/^0\d{9}$/.test(phone.trim())) return notify('Enter a valid phone number', 'Example: 0771234567');
    if (password && password.length < 6) return notify('Password must be at least 6 characters');
    await updateProfile({ name: name.trim(), phone: phone.trim(), password: password || null });
    setEditing(false);
    notify('Saved', 'Your account details have been updated.');
  };

  const Row = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || '?').trim().charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      {editing ? (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput style={[styles.input, styles.locked]} value={`@${user.username}`} editable={false} />
          <Text style={styles.note}>Username can't be changed.</Text>

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <Text style={styles.inputLabel}>New password (optional)</Text>
          <TextInput style={styles.input} secureTextEntry placeholder="Leave empty to keep your password" value={password} onChangeText={setPassword} />

          <TouchableOpacity style={styles.btn} onPress={save}>
            <Text style={styles.btnText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={() => setEditing(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Row label="Full name" value={user.name} />
            <Row label="Username" value={`@${user.username}`} />
            <Row label="Phone" value={user.phone} />
            <Row label="Ads posted" value={String(adCount)} />
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={startEdit}>
            <Text style={styles.editText}>✏️ Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MyAds')}>
            <Text style={styles.btnText}>View My Ads</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logout}
            onPress={async () => {
              await logout();
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  username: { color: colors.muted, textAlign: 'center', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { color: colors.muted },
  value: { fontWeight: '600' },
  inputLabel: { fontWeight: '600', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.bg, padding: 12, borderRadius: 10 },
  locked: { color: colors.muted, backgroundColor: colors.placeholder },
  note: { color: colors.muted, fontSize: 12, marginTop: 4 },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  editBtn: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.edit, padding: 12, borderRadius: 12, marginTop: 4 },
  editText: { color: colors.edit, textAlign: 'center', fontWeight: '700' },
  cancel: { padding: 12, marginTop: 4 },
  cancelText: { color: colors.muted, textAlign: 'center', fontWeight: '600' },
  logout: { padding: 14, marginTop: 6 },
  logoutText: { color: colors.fail, textAlign: 'center', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
});
