import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getListings, deleteListing } from '../utils/storage';
import { confirmAction } from '../utils/alert';
import ListingCard from '../components/ListingCard';
import { colors } from '../theme';

export default function MyAdsScreen({ navigation }) {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);

  const load = async () => {
    const all = await getListings();
    setAds(all.filter((l) => user && l.ownerId === user.id));
  };
  useFocusEffect(useCallback(() => { load(); }, [user]));

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Please login to see your ads</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Auth', {})}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remove = (id) =>
    confirmAction('Delete this ad?', 'The ad and its report will be removed.', async () => {
      await deleteListing(id);
      load();
    });

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>You have not posted any ads yet</Text>}
        renderItem={({ item }) => (
          <View>
            <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -4, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => navigation.push('PostAd', { editId: item.id })} style={{ marginRight: 22 }}>
                <Text style={{ color: colors.accent, fontWeight: '700' }}>✏️ Edit ad</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)}>
                <Text style={{ color: colors.fail }}>Delete ad</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PostAd')}>
        <Text style={styles.btnText}>+ Post New Ad</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
