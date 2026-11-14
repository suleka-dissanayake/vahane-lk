import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput } from '../components/Themed';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/alert';

export default function AuthScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const redirect = route.params?.redirect;

  const done = () => (redirect ? navigation.replace(redirect) : navigation.navigate('Home'));

  const submit = async () => {
    if (!username.trim() || !password) return notify('Enter username and password');
    if (mode === 'register') {
      if (!name.trim()) return notify('Enter your name');
      if (!/^0\d{9}$/.test(phone.trim())) return notify('Enter a valid phone number', 'Example: 0771234567');
      if (password.length < 6) return notify('Password must be at least 6 characters');
      const res = await register({ name: name.trim(), username: username.trim(), password, phone: phone.trim() });
      return res.ok ? done() : notify(res.error);
    }
    const res = await login(username.trim(), password);
    return res.ok ? done() : notify(res.error);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Login' : 'Create account'}</Text>
      <Text style={styles.sub}>You need an account to post ads. Browsing is open to everyone.</Text>

      {mode === 'register' && (
        <>
          <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone (0771234567)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </>
      )}
      <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>{mode === 'login' ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.switch}>
          {mode === 'login' ? "No account? Register" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
      {mode === 'login' && <Text style={styles.hint}>Demo account: demo / demo123</Text>}
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 16, marginTop: 4 },
  input: { backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 10 },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginTop: 6 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  switch: { color: colors.accent, textAlign: 'center', marginTop: 16, fontWeight: '600' },
  hint: { color: colors.muted, textAlign: 'center', marginTop: 12 },
});
