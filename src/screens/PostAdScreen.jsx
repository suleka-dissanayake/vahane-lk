import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import cars from '../data/carModels.json';
import { formatM } from '../utils/format';
import { notify } from '../utils/alert';
import { colors } from '../theme';

const CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Truck'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const GEARS = ['Automatic', 'Manual', 'CVT'];

function Chips({ options, value, onChange }) {
  return (
    <View style={styles.row}>
      {options.map((o) => (
        <TouchableOpacity key={o} onPress={() => onChange(o)} style={[styles.chip, value === o && styles.chipOn]}>
          <Text style={value === o ? { color: '#fff' } : null}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function PostAdScreen({ route, navigation }) {
  const { user } = useAuth();
  const preset = cars.find((c) => c.id === route.params?.carId);
  const [category, setCategory] = useState(preset?.category || 'Hatchback');
  const [carId, setCarId] = useState(preset?.id || null);
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [price, setPrice] = useState('');
  const [fuel, setFuel] = useState(preset ? (preset.specs.Fuel.includes('Hybrid') ? 'Hybrid' : preset.specs.Fuel.includes('Diesel') ? 'Diesel' : 'Petrol') : 'Petrol');
  const [gear, setGear] = useState('Automatic');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) navigation.replace('Auth', { redirect: 'PostAd' });
  }, [user]);
  if (!user) return null;

  const model = cars.find((c) => c.id === carId);

  const next = () => {
    if (!model) return notify('Select the car model');
    const y = Number(year), km = Number(mileage), p = Number(price);
    if (!(y >= 1990 && y <= 2026)) return notify('Enter a valid year', 'Between 1990 and 2026');
    if (!(km >= 0) || mileage === '') return notify('Enter the mileage in km');
    if (!(p > 0)) return notify('Enter the price in LKR');
    if (!district.trim()) return notify('Enter the district');
    if (!/^0\d{9}$/.test(phone.trim())) return notify('Enter a valid phone number');

    navigation.navigate('InspectionForm', {
      details: {
        carModelId: model.id, make: model.make, model: model.model, category: model.category,
        year: y, mileage: km, price: p, fuel, transmission: gear,
        district: district.trim(), phone: phone.trim(), description: description.trim(),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.step}>Step 1 of 2: Vehicle details</Text>

      <Text style={styles.label}>Category</Text>
      <Chips options={CATEGORIES} value={category} onChange={(c) => { setCategory(c); setCarId(null); }} />

      <Text style={styles.label}>Model</Text>
      <View style={styles.row}>
        {cars.filter((c) => c.category === category).map((c) => (
          <TouchableOpacity key={c.id} onPress={() => setCarId(c.id)} style={[styles.chip, carId === c.id && styles.chipOn]}>
            <Text style={carId === c.id ? { color: '#fff' } : null}>{c.make} {c.model}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {model && (
        <Text style={styles.hint}>
          Typical market range: LKR {formatM(model.priceMin)} - {formatM(model.priceMax)}
        </Text>
      )}

      <Text style={styles.label}>Year</Text>
      <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 2016" value={year} onChangeText={setYear} />
      <Text style={styles.label}>Mileage (km)</Text>
      <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 62000" value={mileage} onChangeText={setMileage} />
      <Text style={styles.label}>Price (LKR)</Text>
      <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 6950000" value={price} onChangeText={setPrice} />

      <Text style={styles.label}>Fuel</Text>
      <Chips options={FUELS} value={fuel} onChange={setFuel} />
      <Text style={styles.label}>Transmission</Text>
      <Chips options={GEARS} value={gear} onChange={setGear} />

      <Text style={styles.label}>District</Text>
      <TextInput style={styles.input} placeholder="e.g. Colombo" value={district} onChangeText={setDistrict} />
      <Text style={styles.label}>Contact phone</Text>
      <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={description} onChangeText={setDescription} />

      <TouchableOpacity style={styles.btn} onPress={next}>
        <Text style={styles.btnText}>Next: Inspection report</Text>
      </TouchableOpacity>
      <Text style={styles.note}>An inspection report is required for every ad.</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  step: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 6 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.chip, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.primary },
  hint: { color: colors.accent, marginTop: 2 },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, marginTop: 24 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  note: { color: colors.muted, textAlign: 'center', marginTop: 8 },
});
