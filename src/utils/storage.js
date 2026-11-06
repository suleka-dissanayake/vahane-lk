import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTS_KEY = 'vahane_reports';
const DRAFT_KEY = 'vahane_draft';

export async function getReports() {
  try {
    const json = await AsyncStorage.getItem(REPORTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
}

export async function saveReport(report) {
  const list = await getReports();
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...list]));
}

export async function deleteReport(id) {
  const list = await getReports();
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list.filter((r) => r.id !== id)));
}

export async function getDraft() {
  try {
    const json = await AsyncStorage.getItem(DRAFT_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

export async function saveDraft(draft) {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {}
}

export async function clearDraft() {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch (e) {}
}
