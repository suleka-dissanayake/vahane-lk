import React, { useCallback, useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import cars from '../data/carModels.json';
import { getListings } from '../utils/storage';
import { formatM } from '../utils/format';
import ListingCard from '../components/ListingCard';
import { colors } from '../theme';

export default function ModelDetailScreen({ route, navigation }) {
  const car = cars.find((c) => c.id === route.params?.carId);
  const [ads, setAds] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getListings().then((all) => setAds(all.filter((l) => l.carModelId === route.params?.carId)));
    }, [route.params?.carId])
  );

  if (!car) return <Text style={{ padding: 20 }}>Car not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{car.make} {car.model}</Text>
      <Text style={styles.meta}>{car.category} • {car.yearRange}</Text>
      <Text style={styles.price}>LKR {formatM(car.priceMin)} - {formatM(car.priceMax)}</Text>

      <Text style={styles.head}>Specifications</Text>
      {Object.entries(car.specs).map(([k, v]) => (
        <Text key={k} style={styles.line}>• {k}: {v}</Text>
      ))}

      <Text style={styles.head}>⚠️ Common Faults to Check</Text>
      {car.commonIssues.map((issue, i) => (
        <Text key={i} style={styles.line}>• {issue}</Text>
      ))}

      <Text style={styles.head}>Ads for this model ({ads.length})</Text>
      {ads.length === 0 && <Text style={{ color: colors.muted }}>No ads yet for this model</Text>}
      {ads.map((l) => (
        <ListingCard key={l.id} listing={l} onPress={() => navigation.navigate('ListingDetail', { id: l.id })} />
      ))}

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PostAd', { carId: car.id })}>
        <Text style={styles.btnText}>Post an ad for this car</Text>
      </TouchableOpacity>
      <Text style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: 'bold' },
  meta: { color: colors.muted, marginVertical: 4 },
  price: { fontSize: 18, color: colors.pass, fontWeight: '600' },
  head: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 6 },
  line: { fontSize: 15, marginBottom: 4 },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, marginTop: 20 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});
