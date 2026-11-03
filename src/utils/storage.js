import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'vahane_reports';

export async function getReports() {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) { return []; }
}

export async function saveReport(report) {
  const list = await getReports();
  await AsyncStorage.setItem(KEY, JSON.stringify([report, ...list]));
}

export async function deleteReport(id) {
  const list = await getReports();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter(r => r.id !== id)));
}