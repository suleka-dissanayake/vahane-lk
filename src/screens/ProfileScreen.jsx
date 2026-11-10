import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getListings } from '../utils/storage';
import { colors } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [adCount, setAdCount] = useState(0);

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

  const Row = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || '?').trim().charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Full name" value={user.name} />
        <Row label="Username" value={`@${user.username}`} />
        <Row label="Phone" value={user.phone} />
        <Row label="Ads posted" value={String(adCount)} />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  username: { color: colors.muted, textAlign: 'center', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0dcdc' },
  label: { color: colors.muted },
  value: { fontWeight: '600' },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginTop: 4 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  logout: { padding: 14, marginTop: 6 },
  logoutText: { color: colors.fail, textAlign: 'center', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
});
