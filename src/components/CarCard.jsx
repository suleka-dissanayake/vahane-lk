import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatM } from '../utils/format';

export default function CarCard({ car, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>
        {car.make} {car.model}
      </Text>
      <Text style={styles.meta}>
        {car.category} • {car.yearRange}
      </Text>
      <Text style={styles.price}>
        LKR {formatM(car.priceMin)} - {formatM(car.priceMax)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold' },
  meta: { color: '#555', marginTop: 2 },
  price: { color: '#2a9d8f', fontWeight: '600', marginTop: 4 },
});
