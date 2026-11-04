import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import checklist from '../data/checklistItems.json';
import cars from '../data/carModels.json';
import { saveReport, getDraft, saveDraft, clearDraft } from '../utils/storage';

const OPTIONS = [
  { label: 'Pass', color: '#2a9d8f', points: 1 },
  { label: 'Warning', color: '#e9c46a', points: 0.5 },
  { label: 'Fail', color: '#e63946', points: 0 },
];

export default function InspectionScreen({ route, navigation }) {
  const car = cars.find((c) => c.id === route.params?.carId);
  const [carName, setCarName] = useState(car ? `${car.make} ${car.model}` : '');
  const [results, setResults] = useState({});
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);

  const total = checklist.reduce((n, c) => n + c.items.length, 0);
  const done = Object.keys(results).length;

  // Load saved draft (local progress saving)
  useEffect(() => {
    getDraft().then((d) => {
      if (d) {
        setResults(d.results || {});
        setNotes(d.notes || '');
        if (!car && d.carName) setCarName(d.carName);
      }
      setLoaded(true);
    });
  }, []);

  // Auto-save draft on every change
  useEffect(() => {
    if (loaded) saveDraft({ results, notes, carName });
  }, [results, notes, carName, loaded]);

  const handleSave = async () => {
    if (!carName.trim()) return Alert.alert('Enter the vehicle name');
    if (done === 0) return Alert.alert('Mark at least one item');

    const pts = Object.values(results).reduce(
      (sum, r) => sum + OPTIONS.find((o) => o.label === r).points,
      0
    );
    const report = {
      id: Date.now().toString(),
      carName: carName.trim(),
      date: new Date().toLocaleDateString(),
      score: Math.round((pts / total) * 100),
      results,
      notes,
      failCount: Object.values(results).filter((r) => r === 'Fail').length,
    };
    await saveReport(report);
    await clearDraft();
    setResults({});
    setNotes('');
    Alert.alert('Saved', 'Report saved offline', [
      { text: 'OK', onPress: () => navigation.navigate('SavedReports') },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Vehicle name (e.g. Toyota Vitz 2016)"
        value={carName}
        onChangeText={setCarName}
      />
      <Text style={styles.progress}>
        Progress: {done} / {total}
      </Text>

      {checklist.map((section) => (
        <View key={section.category}>
          <Text style={styles.head}>{section.category}</Text>
          {section.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemText}>{item.text}</Text>
              <View style={styles.row}>
                {OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.label}
                    onPress={() => setResults({ ...results, [item.id]: o.label })}
                    style={[styles.opt, results[item.id] === o.label && { backgroundColor: o.color }]}
                  >
                    <Text style={results[item.id] === o.label ? { color: '#fff' } : null}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}

      <Text style={styles.head}>Notes</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        multiline
        placeholder="Extra observations..."
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fb' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  progress: { marginBottom: 6, color: '#555' },
  head: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 6 },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  itemText: { marginBottom: 8 },
  row: { flexDirection: 'row' },
  opt: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#e0e6f0', borderRadius: 8, marginRight: 8 },
  btn: { backgroundColor: '#1d3557', padding: 16, borderRadius: 12, marginVertical: 20 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
