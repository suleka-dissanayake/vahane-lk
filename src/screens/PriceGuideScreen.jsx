import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import cars from '../data/carModels.json';
import { formatM } from '../utils/format';
import { colors } from '../theme';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Truck'];

export default function PriceGuideScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = cars.filter(
    (c) =>
      (category === 'All' || c.category === category) &&
      `${c.make} ${c.model}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search make or model..." value={query} onChangeText={setQuery} />
      <View style={styles.row}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipOn]}>
            <Text style={category === c ? { color: '#fff' } : null}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No cars found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ModelDetail', { carId: item.id })}>
            <Text style={styles.name}>{item.make} {item.model}</Text>
            <Text style={{ color: colors.muted }}>{item.category} • {item.yearRange}</Text>
            <Text style={styles.price}>LKR {formatM(item.priceMin)} - {formatM(item.priceMax)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.chip, borderRadius: 20, marginRight: 8, marginBottom: 6 },
  chipOn: { backgroundColor: colors.primary },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold' },
  price: { color: colors.pass, fontWeight: '600', marginTop: 4 },
});
