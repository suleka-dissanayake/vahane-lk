import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReports } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [last, setLast] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getReports().then((r) => setLast(r[0] || null));
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vahane.lk</Text>
      <Text style={styles.sub}>Buy your next car with confidence</Text>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Inspection', {})}>
        <Text style={styles.btnText}>🔍 Start New Inspection</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ValuationSearch')}>
        <Text style={styles.btnText}>💰 Search Car Valuations</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.alt]} onPress={() => navigation.navigate('SavedReports')}>
        <Text style={styles.btnText}>📄 Saved Reports</Text>
      </TouchableOpacity>

      {last && (
        <View style={styles.card}>
          <Text style={styles.cardHead}>Latest Report</Text>
          <Text style={styles.cardTitle}>{last.carName}</Text>
          <Text>
            Score: {last.score}% • {last.date}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6fb' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1d3557' },
  sub: { color: '#555', marginBottom: 24 },
  btn: { backgroundColor: '#1d3557', padding: 18, borderRadius: 12, marginBottom: 12 },
  alt: { backgroundColor: '#457b9d' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 16, elevation: 2 },
  cardHead: { color: '#888', fontSize: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
});
