import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, StyleSheet } from 'react-native';
import { Text } from './Themed';
import { REPORT_DETAIL_LABELS } from '../utils/reportFields';
import ScoreBadge from './ScoreBadge';
import { ALL_ITEMS, ALL_SECTIONS, OPTIONS, verdict, countStatus, scoreColor } from '../utils/report';

const colorOf = (label) => OPTIONS.find((o) => o.label === label)?.color || '#999';

export default function InspectionReportView({ report }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { results, notes, score, date } = report;
  const detailRows = Object.entries(report.details || {}).filter(([k]) => REPORT_DETAIL_LABELS[k]);
  const extraRows = (report.extras || []).filter((e) => e.label && e.value);
  const issues = ALL_ITEMS.filter((i) => results[i.id] === 'Fail' || results[i.id] === 'Warning').sort(
    (a, b) => (results[a.id] === 'Fail' ? 0 : 1) - (results[b.id] === 'Fail' ? 0 : 1)
  );

  return (
    <View>
      <View style={styles.summary}>
        <ScoreBadge score={score} size="big" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.verdict, { color: scoreColor(score) }]}>{verdict(score)}</Text>
          <Text style={styles.counts}>
            ✓ {countStatus(results, 'Pass')} pass   ! {countStatus(results, 'Warning')} warning   ✗{' '}
            {countStatus(results, 'Fail')} fail
          </Text>
          <Text style={styles.date}>Inspected on {date}</Text>
        </View>
      </View>

      {issues.length > 0 && (
        <View style={styles.issueBox}>
          <Text style={styles.issueHead}>Issues found</Text>
          {issues.map((i) => (
            <View key={i.id} style={styles.issueRow}>
              <View style={[styles.dot, { backgroundColor: colorOf(results[i.id]) }]} />
              <Text style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{results[i.id]}: </Text>
                {i.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(detailRows.length > 0 || extraRows.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionHead}>Report details</Text>
          {detailRows.map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.itemText}>{REPORT_DETAIL_LABELS[k]}</Text>
              <Text style={{ fontWeight: '600' }}>{String(v)}</Text>
            </View>
          ))}
          {extraRows.map((e, i) => (
            <View key={'x' + i} style={styles.row}>
              <Text style={styles.itemText}>{e.label}</Text>
              <Text style={{ fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{e.value}</Text>
            </View>
          ))}
        </View>
      )}

      {ALL_SECTIONS.filter((section) => section.items.some((i) => results[i.id])).map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.sectionHead}>{section.category}</Text>
          {section.items.filter((i) => results[i.id]).map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemText}>{item.text}</Text>
              <View style={[styles.pill, { backgroundColor: colorOf(results[item.id]) }]}>
                <Text style={[styles.pillText, results[item.id] === 'Warning' && { color: '#333' }]}>
                  {results[item.id]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionHead}>Inspector notes</Text>
          <Text>{notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 14, borderRadius: 12, marginBottom: 10 },
  verdict: { fontSize: 16, fontWeight: 'bold' },
  counts: { marginTop: 4, color: colors.muted },
  date: { marginTop: 2, color: colors.muted, fontSize: 12 },
  issueBox: { backgroundColor: colors.issueBg, borderColor: colors.issueBorder, borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 10 },
  issueHead: { fontWeight: 'bold', marginBottom: 6, color: colors.fail },
  issueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  section: { backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 10 },
  sectionHead: { fontWeight: 'bold', fontSize: 15, marginBottom: 6, color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  itemText: { flex: 1, paddingRight: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
