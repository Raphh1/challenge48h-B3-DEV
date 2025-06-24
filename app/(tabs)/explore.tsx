import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn,
  SlideInUp,
  Layout
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ToiletDetail } from '@/components/ToiletDetail';
import { useToiletData } from '@/hooks/useToiletData';
import { Toilet } from '@/types/Toilet';

export default function ExploreScreen() {
  const { toilets, loading, error } = useToiletData();
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const headerScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
    });
    headerOpacity.value = withTiming(1, {
      duration: 600,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const handleToiletPress = (toilet: Toilet) => {
    setSelectedToilet(toilet);
    setIsDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setIsDetailVisible(false);
    setSelectedToilet(null);
  };

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ThemedText>Chargement des données...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ThemedText>Erreur: {error}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <ThemedText type="title" style={styles.headerText}>
          📊 Statistiques
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Exploration des toilettes publiques de Bordeaux
        </ThemedText>
      </Animated.View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          entering={FadeIn.delay(300)} 
          style={styles.statsContainer}
        >
          <View style={styles.statsGrid}>
            <Animated.View entering={SlideInUp.delay(400)} style={styles.statCard}>
              <ThemedText type="title" style={styles.statNumber}>{stats.total}</ThemedText>
              <ThemedText style={styles.statLabel}>Total</ThemedText>
            </Animated.View>
            <Animated.View entering={SlideInUp.delay(500)} style={styles.statCard}>
              <ThemedText type="title" style={[styles.statNumber, { color: '#28A745' }]}>
                {stats.accessible}
              </ThemedText>
              <ThemedText style={styles.statLabel}>♿ Accessibles</ThemedText>
            </Animated.View>
          </View>

          <View style={styles.statsGrid}>
            <Animated.View entering={SlideInUp.delay(600)} style={styles.statCard}>
              <ThemedText type="title" style={[styles.statNumber, { color: '#28A745' }]}>
                {stats.sanitaires}
              </ThemedText>
              <ThemedText style={styles.statLabel}>🚻 Sanitaires</ThemedText>
            </Animated.View>
            <Animated.View entering={SlideInUp.delay(700)} style={styles.statCard}>
              <ThemedText type="title" style={[styles.statNumber, { color: '#007BFF' }]}>
                {stats.urinoirs}
              </ThemedText>
              <ThemedText style={styles.statLabel}>🚹 Urinoirs</ThemedText>
            </Animated.View>
          </View>

          <View style={styles.statsGrid}>
            <Animated.View entering={SlideInUp.delay(800)} style={styles.statCard}>
              <ThemedText type="title" style={[styles.statNumber, { color: '#FD7E14' }]}>
                {stats.chalets}
              </ThemedText>
              <ThemedText style={styles.statLabel}>🏠 Chalets</ThemedText>
            </Animated.View>
            <Animated.View entering={SlideInUp.delay(900)} style={styles.statCard}>
              <ThemedText type="title" style={[styles.statNumber, { color: '#6610F2' }]}>
                {Math.round((stats.accessible / stats.total) * 100)}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>Accessibilité</ThemedText>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.delay(600)} 
          layout={Layout.springify()}
          style={styles.filtersContainer}
        >
          <ThemedText type="subtitle" style={styles.filtersTitle}>Filtres</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <FilterButton title="Tout" filterValue="ALL" emoji="🔍" />
            <FilterButton title="Accessibles" filterValue="ACCESSIBLE" emoji="♿" />
            <FilterButton title="Sanitaires" filterValue="SANITAIRE_AUTOMATIQUE" emoji="🚻" />
            <FilterButton title="Urinoirs" filterValue="URINOIR" emoji="🚹" />
            <FilterButton title="Chalets" filterValue="CHALET_DE_NECESSITE" emoji="🏠" />
          </ScrollView>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.delay(800)} 
          layout={Layout.springify()}
          style={styles.listContainer}
        >
          <ThemedText type="subtitle" style={styles.listTitle}>
            Liste des toilettes ({filteredToilets.length})
          </ThemedText>
          
          {filteredToilets.map((toilet, index) => (
            <Animated.View 
              key={toilet.gmlId} 
              entering={FadeIn.delay(1000 + index * 50)}
              layout={Layout.springify()}
            >
              <Pressable 
                style={styles.toiletCard}
                onPress={() => handleToiletPress(toilet)}
              >
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
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      <ToiletDetail
        toilet={selectedToilet}
        visible={isDetailVisible}
        onClose={handleCloseDetail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
  },
  headerText: {
    textAlign: 'center',
    color: '#212529',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '400',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsContainer: {
    padding: 20,
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#212529',
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
    color: '#6C757D',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    margin: 15,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filtersTitle: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 5,
    color: '#212529',
  },
  filtersScroll: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  filterButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  filterButtonActive: {
    backgroundColor: '#212529',
    borderColor: '#212529',
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#495057',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
    margin: 15,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  listTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  toiletCard: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#212529',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  toiletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toiletAddress: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  accessibleBadge: {
    fontSize: 20,
    marginLeft: 10,
  },
  toiletType: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 6,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  toiletCoords: {
    fontSize: 12,
    color: '#ADB5BD',
    fontFamily: 'monospace',
    fontWeight: '400',
  },
});
