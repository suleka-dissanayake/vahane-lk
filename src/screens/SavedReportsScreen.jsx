import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReports, deleteReport } from '../utils/storage';

const scoreColor = (sc) => (sc >= 75 ? '#2a9d8f' : sc >= 50 ? '#e9c46a' : '#e63946');

export default function SavedReportsScreen() {
  const [reports, setReports] = useState([]);

  const load = async () => setReports(await getReports());
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const confirmDelete = (id) =>
    Alert.alert('Delete report?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReport(id);
          load();
        },
      },
    ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No saved reports yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.carName}</Text>
              <Text>
                {item.date} • {item.failCount} failed items
              </Text>
              {item.notes ? (
                <Text style={{ color: '#666' }} numberOfLines={2}>
                  {item.notes}
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.score, { color: scoreColor(item.score) }]}>{item.score}%</Text>
              <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                <Text style={{ color: '#e63946' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fb' },
  empty: { textAlign: 'center', marginTop: 40, color: '#555' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  name: { fontSize: 17, fontWeight: 'bold' },
  score: { fontSize: 22, fontWeight: 'bold' },
});
