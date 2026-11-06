import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import cars from '../data/carModels.json';
import CarCard from '../components/CarCard';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Truck'];

export default function ValuationSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = cars.filter(
    (c) =>
      (category === 'All' || c.category === category) &&
      `${c.make} ${c.model}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search make or model..."
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.row}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.chip, category === cat && styles.chipActive]}
          >
            <Text style={category === cat ? styles.chipTextActive : null}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No cars found</Text>}
        renderItem={({ item }) => (
          <CarCard car={item} onPress={() => navigation.navigate('ModelDetail', { carId: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fb' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#e0e6f0', borderRadius: 20, marginRight: 8, marginBottom: 6 },
  chipActive: { backgroundColor: '#1d3557' },
  chipTextActive: { color: '#fff' },
  empty: { textAlign: 'center', marginTop: 30, color: '#555' },
});
