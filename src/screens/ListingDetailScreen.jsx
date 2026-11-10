import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getListing, deleteListing } from '../utils/storage';
import { formatLKR, formatKm, formatM } from '../utils/format';
import { confirmAction } from '../utils/alert';
import cars from '../data/carModels.json';
import InspectionReportView from '../components/InspectionReportView';
import AttachmentViewer from '../components/AttachmentViewer';
import PhotoGallery from '../components/PhotoGallery';
import { colors } from '../theme';

export default function ListingDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const [listing, setListing] = useState(undefined);

  useFocusEffect(
    useCallback(() => {
      getListing(route.params.id).then(setListing);
    }, [route.params.id])
  );

  if (listing === undefined) return null;
  if (!listing) return <Text style={{ padding: 20 }}>This ad no longer exists</Text>;

  const model = cars.find((c) => c.id === listing.carModelId);
  let market = null;
  if (model) {
    if (listing.price < model.priceMin) market = { t: 'Below the typical market range', c: colors.pass };
    else if (listing.price > model.priceMax) market = { t: 'Above the typical market range', c: colors.fail };
    else market = { t: 'Within the typical market range', c: colors.accent };
  }
  const photoIds = listing.photoIds || (listing.photoId ? [listing.photoId] : []);
  const isOwner = user && user.id === listing.ownerId;

  const remove = () =>
    confirmAction('Delete this ad?', 'The ad and its report will be removed.', async () => {
      await deleteListing(listing.id);
      navigation.goBack();
    });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {listing.make} {listing.model} {listing.year} ({listing.condition || 'Used'})
      </Text>
      <Text style={styles.price}>{formatLKR(listing.price)}</Text>
      {market && (
        <Text style={[styles.market, { color: market.c }]}>
          {market.t} ({formatM(model.priceMin)} - {formatM(model.priceMax)})
        </Text>
      )}

      {photoIds.length > 0 && <PhotoGallery ids={photoIds} />}

      <View style={styles.box}>
        {listing.condition ? <Text style={styles.line}>Condition: {listing.condition}</Text> : null}
        <Text style={styles.line}>Category: {listing.category}</Text>
        {listing.condition === 'Reconditioned' && (
          <>
            <Text style={styles.line}>Manufacture country: {listing.manufactureCountry}</Text>
            <Text style={styles.line}>Manufacture year: {listing.year}</Text>
            <Text style={styles.line}>Auction grade: {listing.auctionGrade}</Text>
            <Text style={styles.line}>Auction authority: {listing.auctionAuthority}</Text>
          </>
        )}
        <Text style={styles.line}>Mileage: {formatKm(listing.mileage)}</Text>
        <Text style={styles.line}>Fuel: {listing.fuel}</Text>
        <Text style={styles.line}>Transmission: {listing.transmission}</Text>
        <Text style={styles.line}>Location: {listing.district}</Text>
        <Text style={styles.line}>Posted: {listing.postedDate}</Text>
        {listing.description ? <Text style={[styles.line, { marginTop: 6 }]}>{listing.description}</Text> : null}
      </View>

      <Text style={styles.head}>Inspection Report</Text>
      {listing.attachments && listing.attachments.length > 0 && (
        <>
          <Text style={styles.sub}>📎 Attached report files</Text>
          <AttachmentViewer attachments={listing.attachments} />
        </>
      )}
      <InspectionReportView report={listing.report} />

      {model && (
        <TouchableOpacity style={styles.faultBtn} onPress={() => navigation.navigate('ModelDetail', { carId: model.id })}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>⚠️ See common faults for {model.make} {model.model}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.head}>Seller</Text>
      <View style={styles.box}>
        <Text style={styles.line}>{listing.ownerName}</Text>
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${listing.phone}`)}>
          <Text style={styles.callText}>📞 Call {listing.phone}</Text>
        </TouchableOpacity>
      </View>

      {isOwner && (
        <>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.push('PostAd', { editId: listing.id })}>
          <Text style={styles.editText}>✏️ Edit this ad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.delBtn} onPress={remove}>
          <Text style={styles.delText}>Delete this ad</Text>
        </TouchableOpacity>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: 'bold' },
  price: { fontSize: 22, fontWeight: '700', color: colors.primary, marginTop: 4 },
  market: { marginTop: 2, fontWeight: '600' },
  box: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginTop: 10 },
  line: { marginBottom: 3 },
  sub: { fontWeight: '600', marginBottom: 6, color: colors.accent },
  head: { fontSize: 19, fontWeight: 'bold', marginTop: 20, marginBottom: 8, color: colors.primary },
  faultBtn: { backgroundColor: '#fde8e8', padding: 12, borderRadius: 10, alignItems: 'center' },
  callBtn: { backgroundColor: colors.primary, padding: 12, borderRadius: 10, marginTop: 8 },
  callText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  editBtn: { marginTop: 20, padding: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.edit },
  editText: { color: colors.edit, textAlign: 'center', fontWeight: '700' },
  delBtn: { marginTop: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.fail },
  delText: { color: colors.fail, textAlign: 'center', fontWeight: '600' },
});
