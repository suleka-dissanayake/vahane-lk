import React from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import cars from '../data/carModels.json';
import { formatPrice } from '../utils/format';

export default function ModelDetailScreen({ route, navigation }) {
  const car = cars.find((c) => c.id === route.params?.carId);
  if (!car) return <Text style={{ padding: 20 }}>Car not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {car.make} {car.model}
      </Text>
      <Text style={styles.meta}>
        {car.category} • {car.yearRange}
      </Text>
      <Text style={styles.price}>
        LKR {formatPrice(car.priceMin)} - {formatPrice(car.priceMax)}
      </Text>

      <Text style={styles.head}>Specifications</Text>
      {Object.entries(car.specs).map(([k, v]) => (
        <Text key={k} style={styles.line}>
          • {k}: {v}
        </Text>
      ))}

      <Text style={styles.head}>⚠️ Common Faults to Check</Text>
      {car.commonIssues.map((issue, i) => (
        <Text key={i} style={styles.line}>
          • {issue}
        </Text>
      ))}

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Inspection', { carId: car.id })}>
        <Text style={styles.btnText}>Start Inspection for this Car</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6fb' },
  title: { fontSize: 26, fontWeight: 'bold' },
  meta: { color: '#666', marginVertical: 4 },
  price: { fontSize: 18, color: '#2a9d8f', fontWeight: '600' },
  head: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 6 },
  line: { fontSize: 15, marginBottom: 4 },
  btn: { backgroundColor: '#1d3557', padding: 16, borderRadius: 12, marginTop: 24, marginBottom: 40 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
