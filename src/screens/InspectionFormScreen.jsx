import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import checklist from '../data/checklistItems.json';
import cars from '../data/carModels.json';
import { addListing, getDraft, saveDraft, clearDraft, saveAttachmentData, removeAttachments } from '../utils/storage';
import AttachmentPicker from '../components/AttachmentPicker';
import { OPTIONS, TOTAL_ITEMS, computeScore } from '../utils/report';
import { notify } from '../utils/alert';
import { colors } from '../theme';

export default function InspectionFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const { details } = route.params;
  const model = cars.find((c) => c.id === details.carModelId);
  const draftKey = `${details.make}|${details.model}`.toLowerCase();
  const [results, setResults] = useState({});
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const done = Object.keys(results).length;
  const complete = done === TOTAL_ITEMS;

  // Restore saved draft for the same model (progress saving)
  useEffect(() => {
    getDraft().then((d) => {
      if (d && d.draftKey === draftKey) {
        setResults(d.results || {});
        setNotes(d.notes || '');
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveDraft({ draftKey, results, notes });
  }, [results, notes, loaded]);

  const publish = async () => {
    if (!complete) return notify('Report incomplete', `Mark all ${TOTAL_ITEMS} items before publishing.`);
    const today = new Date().toISOString().slice(0, 10);
    const listing = {
      id: 'L' + Date.now(),
      ownerId: user.id,
      ownerName: user.name,
      ...details,
      postedDate: today,
      report: { results, notes: notes.trim(), score: computeScore(results), date: today },
    };
    const attMeta = attachments.map(({ dataUri, ...meta }) => meta);
    listing.attachments = attMeta;
    try {
      for (const a of attachments) await saveAttachmentData(a.id, a.dataUri);
      await addListing(listing);
    } catch (e) {
      await removeAttachments(attMeta);
      return notify('Could not save', 'Device storage is full. Remove some attached files and try again.');
    }
    await clearDraft();
    notify('Published', 'Your ad is live with its inspection report.');
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'ListingDetail', params: { id: listing.id } }] });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.step}>Step 2 of 2: Inspection report</Text>
      <Text style={styles.sub}>
        {details.make} {details.model} {details.year}. Buyers will see this report on your ad.
      </Text>

      {model && (
        <View style={styles.faults}>
          <Text style={styles.faultHead}>⚠️ Common faults for this model. Check these carefully:</Text>
          {model.commonIssues.map((i, k) => (
            <Text key={k}>• {i}</Text>
          ))}
        </View>
      )}

      <Text style={styles.progress}>
        Progress: {done} / {TOTAL_ITEMS}
      </Text>

      {checklist.map((section) => (
        <View key={section.category}>
          <Text style={styles.head}>{section.category}</Text>
          {section.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={{ marginBottom: 8 }}>{item.text}</Text>
              <View style={styles.row}>
                {OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.label}
                    onPress={() => setResults({ ...results, [item.id]: o.label })}
                    style={[styles.opt, results[item.id] === o.label && { backgroundColor: o.color }]}
                  >
                    <Text style={results[item.id] === o.label ? { color: o.label === 'Warning' ? '#333' : '#fff' } : null}>
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}

      <AttachmentPicker items={attachments} onChange={setAttachments} />

      <Text style={styles.head}>Notes</Text>
      <TextInput
        style={styles.notes}
        multiline
        placeholder="Anything buyers should know..."
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={[styles.btn, !complete && { opacity: 0.5 }]} onPress={publish}>
        <Text style={styles.btnText}>Publish Ad</Text>
      </TouchableOpacity>
      {!complete && <Text style={styles.warn}>Complete all {TOTAL_ITEMS} items to publish ({TOTAL_ITEMS - done} left)</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  step: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 10 },
  faults: { backgroundColor: '#fff8e6', padding: 12, borderRadius: 10, marginBottom: 8 },
  faultHead: { fontWeight: 'bold', marginBottom: 4 },
  progress: { marginTop: 4, color: colors.muted },
  head: { fontSize: 17, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  row: { flexDirection: 'row' },
  opt: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.chip, borderRadius: 8, marginRight: 8 },
  notes: { backgroundColor: '#fff', padding: 12, borderRadius: 10, height: 90, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, marginTop: 20 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  warn: { textAlign: 'center', color: colors.fail, marginTop: 8 },
});
