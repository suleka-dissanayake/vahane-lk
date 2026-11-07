import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import cars from '../data/carModels.json';
import { addListing, updateListing, getListing, getAttachmentData, getDraft, saveDraft, clearDraft, saveAttachmentData, removeAttachments } from '../utils/storage';
import AttachmentPicker from '../components/AttachmentPicker';
import { OPTIONS, getChecklist, totalItems, computeScore } from '../utils/report';
import { REPORT_FIELDS } from '../utils/reportFields';
import { notify } from '../utils/alert';
import { colors } from '../theme';

export default function InspectionFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const { details, photos = [], editId } = route.params;
  const condition = details.condition === 'Reconditioned' ? 'Reconditioned' : 'Used';
  const sections = getChecklist(condition);
  const total = totalItems(condition);
  const fields = REPORT_FIELDS[condition];
  const model = cars.find((c) => c.id === details.carModelId);
  const draftKey = `${condition}|${details.make}|${details.model}`.toLowerCase();

  const [results, setResults] = useState({});
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [original, setOriginal] = useState(null); // the existing ad when editing
  const [attachments, setAttachments] = useState([]);
  // Report details start from the step 1 values and the user can edit every field
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, details[f.key] != null ? String(details[f.key]) : '']))
  );

  const itemIds = sections.flatMap((sec) => sec.items.map((i) => i.id));
  const done = itemIds.filter((id) => results[id]).length;
  const complete = done === total;

  // Restore saved draft for the same vehicle (progress saving)
  useEffect(() => {
    if (editId) { setLoaded(true); return; }
    getDraft().then((d) => {
      if (d && d.draftKey === draftKey) {
        setResults(d.results || {});
        setNotes(d.notes || '');
        if (d.values) {
          const reportOnly = Object.fromEntries(fields.filter((f) => f.target === 'report' && d.values[f.key]).map((f) => [f.key, d.values[f.key]]));
          setValues((v) => ({ ...v, ...reportOnly }));
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded && !editId) saveDraft({ draftKey, results, notes, values });
  }, [results, notes, values, loaded]);

  // Edit mode: load the saved report, details and report files
  useEffect(() => {
    if (!editId) return;
    let alive = true;
    (async () => {
      const l = await getListing(editId);
      if (!l || !alive) return;
      setOriginal(l);
      setResults(l.report.results || {});
      setNotes(l.report.notes || '');
      const rd = l.report.details || {};
      setValues((v) => ({
        ...v,
        ...Object.fromEntries(fields.filter((f) => f.target === 'report' && rd[f.key] != null).map((f) => [f.key, String(rd[f.key])])),
      }));
      const atts = await Promise.all((l.attachments || []).map(async (a) => ({ ...a, dataUri: await getAttachmentData(a.id) })));
      if (alive) setAttachments(atts.filter((a) => a.dataUri));
    })();
    return () => { alive = false; };
  }, [editId]);

  const setField = (key, text) => setValues((v) => ({ ...v, [key]: text }));

  const publish = async () => {
    if (editId && !original) return notify('Please wait', 'Your ad is still loading.');
    if (attachments.length === 0) return notify('Inspection report required', 'Attach a photo or PDF of the inspection report to publish your ad.');

    for (const f of fields) {
      const v = (values[f.key] || '').trim();
      if (f.required && !v) return notify(`Enter: ${f.label}`);
      if (!v) continue;
      if (f.kind === 'number' && !(Number(v) >= 0)) return notify(`${f.label} must be a number`);
      if (f.kind === 'year' && !(Number(v) >= 1990 && Number(v) <= 2026)) return notify(`Enter a valid ${f.label.toLowerCase()}`, 'Between 1990 and 2026');
      if (f.kind === 'date' && !(/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)))) return notify('Enter the inspection date as YYYY-MM-DD');
    }
    if (!complete) return notify('Report incomplete', `Mark all ${total} items before publishing.`);

    const listingExtra = {};
    const reportDetails = {};
    fields.forEach((f) => {
      const v = (values[f.key] || '').trim();
      if (!v) return;
      const val = f.kind === 'number' || f.kind === 'year' ? Number(v) : v;
      (f.target === 'report' ? reportDetails : listingExtra)[f.key] = val;
    });

    const today = new Date().toISOString().slice(0, 10);
    // Only keep answers for the checklist items that apply to the current condition
    const allowed = new Set(itemIds);
    const cleanResults = Object.fromEntries(Object.entries(results).filter(([id]) => allowed.has(id)));
    const attMeta = attachments.map(({ dataUri, ...meta }) => meta);
    const listing = {
      id: original ? original.id : 'L' + Date.now(),
      ownerId: original ? original.ownerId : user.id,
      ownerName: original ? original.ownerName : user.name,
      ...details,
      ...listingExtra,
      postedDate: original ? original.postedDate : today,
      report: {
        results: cleanResults,
        notes: notes.trim(),
        score: computeScore(cleanResults, condition),
        date: reportDetails.inspectionDate || today,
        details: reportDetails,
      },
      attachments: attMeta,
    };
    if (photos.length) listing.photoIds = photos.map((p) => p.id);

    // Files (report attachments + vehicle photos) saved before and after this edit
    const oldIds = original
      ? [...(original.attachments || []).map((a) => a.id), ...(original.photoIds || (original.photoId ? [original.photoId] : []))]
      : [];
    const newFiles = [...attachments.map((a) => ({ id: a.id, dataUri: a.dataUri })), ...photos.map((p) => ({ id: p.id, dataUri: p.dataUri }))];
    const added = newFiles.filter((f) => !oldIds.includes(f.id));
    try {
      for (const f of added) await saveAttachmentData(f.id, f.dataUri);
      if (original) await updateListing(listing);
      else await addListing(listing);
    } catch (e) {
      await removeAttachments(added.map((f) => ({ id: f.id })));
      return notify('Could not save', 'Device storage is full. Remove some photos or files and try again.');
    }
    if (original) {
      const keep = new Set(newFiles.map((f) => f.id));
      await removeAttachments(oldIds.filter((id) => !keep.has(id)).map((id) => ({ id })));
    } else {
      await clearDraft();
    }
    notify(original ? 'Saved' : 'Published', original ? 'Your changes have been saved.' : 'Your ad is live with its inspection report.');
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'ListingDetail', params: { id: listing.id } }] });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>{editId ? 'Edit ad. ' : ''}Step 2 of 2: Inspection report ({condition})</Text>
      <Text style={styles.sub}>
        {details.make} {details.model} {details.year}. Buyers will see this report on your ad.
      </Text>

      <AttachmentPicker items={attachments} onChange={setAttachments} />

      <Text style={styles.head}>Report details</Text>
      <Text style={styles.sub}>Enter the details exactly as printed on the report.</Text>
      <View style={styles.box}>
        {fields.map((f) => (
          <View key={f.key}>
            <Text style={styles.label}>
              {f.label}{f.required ? ' *' : ''}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType={f.kind === 'number' || f.kind === 'year' ? 'numeric' : 'default'}
              placeholder={f.placeholder}
              value={values[f.key]}
              onChangeText={(t) => setField(f.key, t)}
            />
          </View>
        ))}
      </View>

      {model && (
        <View style={styles.faults}>
          <Text style={styles.faultHead}>⚠️ Common faults for this model. Check these carefully:</Text>
          {model.commonIssues.map((i, k) => (
            <Text key={k}>• {i}</Text>
          ))}
        </View>
      )}

      <Text style={styles.progress}>
        Checklist progress: {done} / {total}
      </Text>

      {sections.map((section) => (
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

      <Text style={styles.head}>Notes</Text>
      <TextInput
        style={styles.notes}
        multiline
        placeholder="Anything buyers should know..."
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={[styles.btn, (!complete || attachments.length === 0) && { opacity: 0.5 }]} onPress={publish}>
        <Text style={styles.btnText}>{editId ? 'Save Changes' : 'Publish Ad'}</Text>
      </TouchableOpacity>
      {attachments.length === 0 && <Text style={styles.warn}>Attach the inspection report to continue</Text>}
      {!complete && <Text style={styles.warn}>Complete all {total} checklist items to publish ({total - done} left)</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  step: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 10 },
  box: { backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: colors.bg, padding: 10, borderRadius: 8 },
  faults: { backgroundColor: '#fff8e6', padding: 12, borderRadius: 10, marginTop: 12 },
  faultHead: { fontWeight: 'bold', marginBottom: 4 },
  progress: { marginTop: 12, color: colors.muted },
  head: { fontSize: 17, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  row: { flexDirection: 'row' },
  opt: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.chip, borderRadius: 8, marginRight: 8 },
  notes: { backgroundColor: '#fff', padding: 12, borderRadius: 10, height: 90, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, marginTop: 20 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  warn: { textAlign: 'center', color: colors.fail, marginTop: 8 },
});
