import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import cars from '../data/carModels.json';
import { formatM } from '../utils/format';
import { notify } from '../utils/alert';
import Dropdown from '../components/Dropdown';
import { pickPhoto, takePhoto } from '../utils/files';
import { getListing, getAttachmentData } from '../utils/storage';
import { colors } from '../theme';

const MAX_PHOTOS = 10;
const CONDITIONS = ['Used', 'Reconditioned'];
const CATEGORIES = ['Car', 'SUV', 'Van', 'Lorry', 'Motorcycle', 'Threewheel', 'Pickup'];
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ label: c, value: c }));
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'PHEV', 'Electric'];
const GEARS = ['Automatic', 'Manual'];
const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna',
  'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];
const DISTRICT_OPTIONS = DISTRICTS.map((d) => ({ label: d, value: d }));

// Maps the older dataset categories onto the new category list (used when coming from a model page)
const LEGACY_CATEGORY = { Sedan: 'Car', Hatchback: 'Car', SUV: 'SUV', Truck: 'Pickup' };

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
  const [condition, setCondition] = useState(null); // 'Used' | 'Reconditioned'
  const [category, setCategory] = useState(preset ? LEGACY_CATEGORY[preset.category] || null : null);
  const [make, setMake] = useState(preset?.make || '');
  const [model, setModel] = useState(preset?.model || '');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [price, setPrice] = useState('');
  const [fuel, setFuel] = useState(preset ? (preset.specs.Fuel.includes('Hybrid') ? 'Hybrid' : preset.specs.Fuel.includes('Diesel') ? 'Diesel' : 'Petrol') : 'Petrol');
  const [gear, setGear] = useState('Automatic');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  // Reconditioned only
  const [country, setCountry] = useState('');
  const [grade, setGrade] = useState('');
  const [authority, setAuthority] = useState('');

  useEffect(() => {
    if (!user) navigation.replace('Auth', { redirect: 'PostAd' });
  }, [user]);

  // Edit mode: load the existing ad into the form
  const editId = route.params?.editId;
  const [editReady, setEditReady] = useState(!editId);
  useEffect(() => {
    if (!editId || !user) return;
    navigation.setOptions({ title: 'Edit Ad' });
    (async () => {
      const l = await getListing(editId);
      if (!l || l.ownerId !== user.id) {
        notify('You can only edit your own ads');
        return navigation.goBack();
      }
      setCondition(l.condition || 'Used');
      setCategory(LEGACY_CATEGORY[l.category] || l.category);
      setMake(l.make || '');
      setModel(l.model || '');
      setYear(String(l.year ?? ''));
      setMileage(String(l.mileage ?? ''));
      setPrice(String(l.price ?? ''));
      setFuel(l.fuel || 'Petrol');
      setGear(l.transmission || 'Automatic');
      setDistrict(l.district || '');
      setPhone(l.phone || '');
      setDescription(l.description || '');
      setCountry(l.manufactureCountry || '');
      setGrade(l.auctionGrade || '');
      setAuthority(l.auctionAuthority || '');
      const ids = l.photoIds || (l.photoId ? [l.photoId] : []);
      const loaded = await Promise.all(ids.map(async (id) => ({ id, name: 'photo', type: 'image', dataUri: await getAttachmentData(id) })));
      setPhotos(loaded.filter((p) => p.dataUri));
      setEditReady(true);
    })();
  }, [editId, user]);
  if (!user) return null;
  if (!editReady) return null;

  const isRecon = condition === 'Reconditioned';
  // If the typed make + model matches a known model, we can show the market range and common faults
  const known = cars.find(
    (c) => c.make.toLowerCase() === make.trim().toLowerCase() && c.model.toLowerCase() === model.trim().toLowerCase()
  );

  const addPhoto = async (picker) => {
    if (photos.length >= MAX_PHOTOS) return notify(`You can add up to ${MAX_PHOTOS} photos`);
    const f = await picker();
    if (f) setPhotos((prev) => (prev.length >= MAX_PHOTOS ? prev : [...prev, f]));
  };

  const next = () => {
    if (!condition) return notify('Select Used or Reconditioned');
    if (!category) return notify('Select the category');
    if (!make.trim()) return notify('Enter the make', 'e.g. Toyota');
    if (!model.trim()) return notify('Enter the model', 'e.g. Vitz');
    const y = Number(year), km = Number(mileage), p = Number(price);
    if (!(y >= 1990 && y <= 2026)) return notify(isRecon ? 'Enter a valid manufacture year' : 'Enter a valid year', 'Between 1990 and 2026');
    if (isRecon) {
      if (!country.trim()) return notify('Enter the manufacture country');
      if (!grade.trim()) return notify('Enter the auction grade');
      if (!authority.trim()) return notify('Enter the auction authority');
    }
    if (!(km >= 0) || mileage === '') return notify('Enter the mileage in km');
    if (!(p > 0)) return notify('Enter the price in LKR');
    if (!district) return notify('Select the district');
    if (!/^0\d{9}$/.test(phone.trim())) return notify('Enter a valid phone number');
    if (!description.trim()) return notify('Enter a description');

    navigation.navigate('InspectionForm', {
      photos,
      editId,
      details: {
        carModelId: known ? known.id : null,
        condition,
        make: make.trim(), model: model.trim(), category,
        year: y, mileage: km, price: p, fuel, transmission: gear,
        ...(isRecon ? { manufactureCountry: country.trim(), auctionGrade: grade.trim(), auctionAuthority: authority.trim() } : {}),
        district, phone: phone.trim(), description: description.trim(),
      },
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>{editId ? 'Edit ad. ' : ''}Step 1 of 2: Vehicle details</Text>

      <Text style={styles.label}>Is the vehicle Used or Reconditioned?</Text>
      <Chips options={CONDITIONS} value={condition} onChange={setCondition} />

      {condition && (
        <>
          <Text style={styles.label}>Category</Text>
          <Dropdown options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder="Select category" style={styles.full} />

          <Text style={styles.label}>Make</Text>
          <TextInput style={styles.input} placeholder="e.g. Toyota" value={make} onChangeText={setMake} />
          <Text style={styles.label}>Model</Text>
          <TextInput style={styles.input} placeholder="e.g. Vitz" value={model} onChangeText={setModel} />
          {known && (
            <Text style={styles.hint}>
              Typical market range: LKR {formatM(known.priceMin)} - {formatM(known.priceMax)}
            </Text>
          )}

          <Text style={styles.label}>{isRecon ? 'Manufacture year' : 'Year'}</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 2016" value={year} onChangeText={setYear} />

          {isRecon && (
            <>
              <Text style={styles.label}>Manufacture country</Text>
              <TextInput style={styles.input} placeholder="e.g. Japan" value={country} onChangeText={setCountry} />
              <Text style={styles.label}>Auction grade</Text>
              <TextInput style={styles.input} placeholder="e.g. 4.5" value={grade} onChangeText={setGrade} />
              <Text style={styles.label}>Auction authority</Text>
              <TextInput style={styles.input} placeholder="e.g. USS Tokyo" value={authority} onChangeText={setAuthority} />
            </>
          )}

          <Text style={styles.label}>Mileage (km)</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 62000" value={mileage} onChangeText={setMileage} />
          <Text style={styles.label}>Price (LKR)</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 6950000" value={price} onChangeText={setPrice} />

          <Text style={styles.label}>Fuel</Text>
          <Chips options={FUELS} value={fuel} onChange={setFuel} />
          <Text style={styles.label}>Transmission</Text>
          <Chips options={GEARS} value={gear} onChange={setGear} />

          <Text style={styles.label}>District</Text>
          <Dropdown options={DISTRICT_OPTIONS} value={district} onChange={setDistrict} placeholder="Select district" style={styles.full} />
          <Text style={styles.label}>Contact phone</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={description} onChangeText={setDescription} />

          <Text style={styles.label}>Vehicle photos (optional, up to {MAX_PHOTOS})</Text>
          <Text style={styles.hint}>The first photo you add is shown in search results.</Text>
          <View style={[styles.row, { marginTop: 8 }]}>
            <TouchableOpacity style={styles.chip} onPress={() => addPhoto(pickPhoto)}>
              <Text>🖼️ Add photo</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.chip} onPress={() => addPhoto(takePhoto)}>
                <Text>📷 Camera</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.photoCount}>{photos.length} / {MAX_PHOTOS}</Text>
          </View>
          {photos.length > 0 && (
            <View style={styles.row}>
              {photos.map((p, i) => (
                <View key={p.id} style={styles.thumbWrap}>
                  <Image source={{ uri: p.dataUri }} style={styles.thumb} />
                  {i === 0 && <Text style={styles.cover}>Cover</Text>}
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setPhotos(photos.filter((x) => x.id !== p.id))}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={next}>
            <Text style={styles.btnText}>Next: Inspection report</Text>
          </TouchableOpacity>
          <Text style={styles.note}>An inspection report is required for every ad.</Text>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  step: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 6 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  full: { flex: 0, alignSelf: 'stretch' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.chip, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.primary },
  photoCount: { alignSelf: 'center', color: colors.muted, marginLeft: 4, marginBottom: 8 },
  thumbWrap: { width: 96, height: 72, marginRight: 8, marginBottom: 8 },
  thumb: { width: 96, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  cover: { position: 'absolute', left: 4, bottom: 4, backgroundColor: colors.primary, color: '#fff', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, overflow: 'hidden' },
  removeBtn: { position: 'absolute', right: 3, top: 3, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  hint: { color: colors.accent, marginTop: 2 },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, marginTop: 24 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  note: { color: colors.muted, textAlign: 'center', marginTop: 8 },
});
