import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getListings } from '../utils/storage';
import cars from '../data/carModels.json';
import ListingCard from '../components/ListingCard';
import Dropdown from '../components/Dropdown';
import Logo from '../components/Logo';
import { filterListings } from '../utils/search';
import { colors } from '../theme';

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Car', value: 'car' },
  { label: 'SUV', value: 'suv' },
  { label: 'Van', value: 'van' },
  { label: 'Lorry', value: 'lorry' },
  { label: 'Motorcycle', value: 'motorcycle' },
  { label: 'Threewheel', value: 'threewheel' },
  { label: 'Pickup', value: 'pickup' },
];
const CONDITION_OPTIONS = [
  { label: 'Used & Recon', value: 'all' },
  { label: 'Used', value: 'Used' },
  { label: 'Reconditioned', value: 'Reconditioned' },
];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'priceLow' },
  { label: 'Price: High to Low', value: 'priceHigh' },
  { label: 'Best inspection', value: 'inspection' },
];

function PersonIcon() {
  return (
    <View style={{ alignItems: 'center', marginRight: 10 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#000' }} />
      <View style={{ width: 17, height: 8, borderTopLeftRadius: 9, borderTopRightRadius: 9, backgroundColor: '#000', marginTop: 2 }} />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [condition, setCondition] = useState('all');
  const [sort, setSort] = useState('newest');

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

  const shown = filterListings(listings, { type, condition, sort });

  const search = () => navigation.navigate('SearchResults', { query: query.trim(), type, condition, sort });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.top}>
        <Logo width={210} />
      </View>

      {user ? (
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.name || '?').trim().charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi} numberOfLines={1}>Hi, {user.name}</Text>
            <Text style={styles.viewProfile}>View your profile</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.sub}>Every ad comes with an inspection report</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.accountBtn}
          onPress={() => navigation.navigate(user ? 'MyAds' : 'Auth', user ? undefined : {})}
        >
          <PersonIcon />
          <Text style={styles.accountText}>{user ? 'My Ads' : 'Login / Register'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postBtn} onPress={goPost}>
          <Text style={styles.postText}>+ Post Ad</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search any vehicle"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
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

      <View style={styles.filters}>
        <Dropdown options={TYPE_OPTIONS} value={type} onChange={setType} />
        <Dropdown options={CONDITION_OPTIONS} value={condition} onChange={setCondition} style={styles.filterGap} />
        <Dropdown options={SORT_OPTIONS} value={sort} onChange={setSort} />
      </View>

      <Text style={styles.count}>{shown.length} ads</Text>

      <FlatList
        data={shown}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No ads found. Try changing the filters.
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
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  profileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 18 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: colors.primary, fontSize: 20, fontWeight: 'bold' },
  hi: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
  viewProfile: { color: '#cfe0f5', marginTop: 2 },
  chev: { color: '#fff', fontSize: 28, marginLeft: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 6 },
  postBtn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12 },
  postText: { color: '#fff', fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 20 },
  accountBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d6deec', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 },
  accountText: { color: '#000', fontWeight: '700', fontSize: 17 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingLeft: 12, paddingVertical: 4, marginBottom: 14, borderWidth: 1, borderColor: '#d6deec' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15 },
  searchBtn: { backgroundColor: colors.primary, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 9, marginLeft: 6 },
  searchBtnText: { color: '#fff', fontWeight: '700' },
  clear: { color: colors.muted, fontSize: 16, padding: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  suggest: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e8eef7', borderRadius: 16, marginRight: 8, marginBottom: 6, borderWidth: 1, borderColor: '#c9d6ea' },
  filters: { flexDirection: 'row', marginBottom: 14 },
  filterGap: { marginHorizontal: 8 },
  count: { color: colors.muted, marginBottom: 6, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
});
