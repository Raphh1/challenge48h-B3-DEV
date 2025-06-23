import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useToiletData } from '@/hooks/useToiletData';
import { Toilet } from '@/types/Toilet';

export default function ExploreScreen() {
  const { toilets, loading, error } = useToiletData();
  const [filter, setFilter] = useState<string>('ALL');

  const getFilteredToilets = () => {
    if (filter === 'ALL') return toilets;
    if (filter === 'ACCESSIBLE') return toilets.filter(t => t.handi === 'OUI');
    return toilets.filter(t => t.type === filter);
  };

  const getStats = () => {
    const total = toilets.length;
    const accessible = toilets.filter(t => t.handi === 'OUI').length;
    const sanitaires = toilets.filter(t => t.type === 'SANITAIRE_AUTOMATIQUE').length;
    const urinoirs = toilets.filter(t => t.type === 'URINOIR').length;
    const chalets = toilets.filter(t => t.type === 'CHALET_DE_NECESSITE').length;

    return { total, accessible, sanitaires, urinoirs, chalets };
  };

  const stats = getStats();
  const filteredToilets = getFilteredToilets();

  const FilterButton = ({ title, filterValue, emoji }: { title: string; filterValue: string; emoji?: string }) => (
    <Pressable
      style={[
        styles.filterButton,
        filter === filterValue && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <ThemedText style={[
        styles.filterButtonText,
        filter === filterValue && styles.filterButtonTextActive
      ]}>
        {emoji && `${emoji} `}{title}
      </ThemedText>
    </Pressable>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Erreur: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">📊 Statistiques</ThemedText>
        <ThemedText style={styles.subtitle}>
          Exploration des toilettes publiques de Bordeaux
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText type="title" style={styles.statNumber}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="title" style={[styles.statNumber, { color: '#4CAF50' }]}>
              {stats.accessible}
            </ThemedText>
            <ThemedText style={styles.statLabel}>♿ Accessibles</ThemedText>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText type="title" style={[styles.statNumber, { color: '#4CAF50' }]}>
              {stats.sanitaires}
            </ThemedText>
            <ThemedText style={styles.statLabel}>🚻 Sanitaires</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="title" style={[styles.statNumber, { color: '#2196F3' }]}>
              {stats.urinoirs}
            </ThemedText>
            <ThemedText style={styles.statLabel}>🚹 Urinoirs</ThemedText>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText type="title" style={[styles.statNumber, { color: '#FF9800' }]}>
              {stats.chalets}
            </ThemedText>
            <ThemedText style={styles.statLabel}>🏠 Chalets</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="title" style={[styles.statNumber, { color: '#9C27B0' }]}>
              {Math.round((stats.accessible / stats.total) * 100)}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Accessibilité</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.filtersContainer}>
        <ThemedText type="subtitle" style={styles.filtersTitle}>Filtres</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <FilterButton title="Tout" filterValue="ALL" emoji="🔍" />
          <FilterButton title="Accessibles" filterValue="ACCESSIBLE" emoji="♿" />
          <FilterButton title="Sanitaires" filterValue="SANITAIRE_AUTOMATIQUE" emoji="🚻" />
          <FilterButton title="Urinoirs" filterValue="URINOIR" emoji="🚹" />
          <FilterButton title="Chalets" filterValue="CHALET_DE_NECESSITE" emoji="🏠" />
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.listContainer}>
        <ThemedText type="subtitle" style={styles.listTitle}>
          Liste des toilettes ({filteredToilets.length})
        </ThemedText>
        
        {filteredToilets.map((toilet) => (
          <View key={toilet.gmlId} style={styles.toiletCard}>
            <View style={styles.toiletHeader}>
              <ThemedText type="defaultSemiBold" style={styles.toiletAddress}>
                📍 {toilet.adresse}
              </ThemedText>
              {toilet.handi === 'OUI' && (
                <ThemedText style={styles.accessibleBadge}>♿</ThemedText>
              )}
            </View>
            <ThemedText style={styles.toiletType}>
              {toilet.type.replace(/_/g, ' ').toLowerCase()}
            </ThemedText>
            <ThemedText style={styles.toiletCoords}>
              {toilet.coordinates.latitude.toFixed(6)}, {toilet.coordinates.longitude.toFixed(6)}
            </ThemedText>
          </View>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 5,
  },
  statsContainer: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filtersTitle: {
    marginBottom: 10,
  },
  filtersScroll: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  filterButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  listTitle: {
    marginBottom: 15,
  },
  toiletCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  toiletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  toiletAddress: {
    flex: 1,
    fontSize: 16,
  },
  accessibleBadge: {
    fontSize: 18,
    marginLeft: 10,
  },
  toiletType: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  toiletCoords: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'monospace',
  },
});
