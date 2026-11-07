import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getListings } from '../utils/storage';
import cars from '../data/carModels.json';
import ListingCard from '../components/ListingCard';
import { colors } from '../theme';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Truck'];
const SORTS = ['Newest', 'Price: Low', 'Best inspection'];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');

  useFocusEffect(
    useCallback(() => {
      getListings().then(setListings);
    }, [])
  );

  const goPost = () => (user ? navigation.navigate('PostAd') : navigation.navigate('Auth', { redirect: 'PostAd' }));

  const q = query.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  // Model suggestions from the local car dataset
  const suggestions = q
    ? cars.filter((c) => {
        const name = `${c.make} ${c.model}`.toLowerCase();
        return terms.every((t) => name.includes(t)) && name !== q;
      }).slice(0, 5)
    : [];

  const shown = listings
    .filter((l) => {
      const text = `${l.make} ${l.model} ${l.year} ${l.district}`.toLowerCase();
      return (category === 'All' || l.category === category) && terms.every((t) => text.includes(t));
    })
    .sort((a, b) => {
      if (sort === 'Price: Low') return a.price - b.price;
      if (sort === 'Best inspection') return b.report.score - a.report.score;
      return b.postedDate.localeCompare(a.postedDate);
    });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Vahane.lk</Text>
          <Text style={styles.sub}>{user ? `Hi, ${user.name}` : 'Every ad comes with an inspection report'}</Text>
        </View>
        <TouchableOpacity style={styles.postBtn} onPress={goPost}>
          <Text style={styles.postText}>+ Post Ad</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('PriceGuide')}>
          <Text style={styles.link}>💰 Price Guide</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(user ? 'MyAds' : 'Auth', user ? undefined : {})}>
          <Text style={styles.link}>{user ? '👤 My Ads' : '🔑 Login / Register'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by model, e.g. Vitz, Premio, Hilux..."
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.row}>
          {suggestions.map((c) => (
            <TouchableOpacity key={c.id} style={styles.suggest} onPress={() => setQuery(`${c.make} ${c.model}`)}>
              <Text style={{ color: colors.primary }}>{c.make} {c.model}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipOn]}>
            <Text style={category === c ? styles.chipTextOn : null}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.row}>
        {SORTS.map((s) => (
          <TouchableOpacity key={s} onPress={() => setSort(s)} style={[styles.chip, styles.sortChip, sort === s && styles.sortOn]}>
            <Text style={sort === s ? styles.chipTextOn : null}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.count}>
        {q ? `${shown.length} ad${shown.length === 1 ? '' : 's'} for “${query.trim()}”` : `${shown.length} ads`}
      </Text>

      <FlatList
        data={shown}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No ads found{q ? ` for “${query.trim()}”. Try another model or clear the search.` : ''}
          </Text>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 6 },
  postBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  postText: { color: '#fff', fontWeight: '700' },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  link: { color: colors.accent, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, marginBottom: 8, borderWidth: 1, borderColor: '#d6deec' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 },
  clear: { color: colors.muted, fontSize: 16, padding: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  suggest: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e8eef7', borderRadius: 16, marginRight: 8, marginBottom: 6, borderWidth: 1, borderColor: '#c9d6ea' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.chip, borderRadius: 20, marginRight: 8, marginBottom: 6 },
  chipOn: { backgroundColor: colors.primary },
  sortChip: { backgroundColor: '#eef1f6' },
  sortOn: { backgroundColor: colors.accent },
  chipTextOn: { color: '#fff' },
  count: { color: colors.muted, marginBottom: 6, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
});
