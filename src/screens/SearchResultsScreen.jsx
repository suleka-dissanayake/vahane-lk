import React, { useCallback, useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from '../components/Themed';
import { useFocusEffect } from '@react-navigation/native';
import { getListings } from '../utils/storage';
import { filterListings } from '../utils/search';
import ListingCard from '../components/ListingCard';

export default function SearchResultsScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { query = '', type = 'all', condition = 'all', sort = 'newest' } = route.params || {};
  const [listings, setListings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getListings().then(setListings);
    }, [])
  );

  const shown = filterListings(listings, { query, type, condition, sort });
  const q = query.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.count}>
        {q ? `${shown.length} ad${shown.length === 1 ? '' : 's'} for “${q}”` : `${shown.length} ad${shown.length === 1 ? '' : 's'}`}
      </Text>
      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No ads found{q ? ` for “${q}”` : ''}. Try another model or change the filters.</Text>
        }
        renderItem={({ item }) => (
          <ListingCard showPhoto listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
        )}
      />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  count: { color: colors.muted, marginBottom: 10, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 30, color: colors.muted },
});
