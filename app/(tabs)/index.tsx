import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';
import { ToiletMap } from '@/components/ToiletMap';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const headerScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const mapScale = useSharedValue(0.95);

  useEffect(() => {
    headerScale.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
    });
    headerOpacity.value = withTiming(1, {
      duration: 600,
    });
    mapScale.value = withSpring(1, {
      damping: 25,
      stiffness: 100,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mapScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <ThemedText type="title" style={styles.headerText}>
            🚻 Toilettes publiques
          </ThemedText>
          <ThemedText type="title" style={styles.headerSubtext}>
            Bordeaux
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Trouvez les toilettes publiques les plus proches
          </ThemedText>
        </Animated.View>
        
        <Animated.View 
          style={[styles.mapContainer, mapAnimatedStyle]}
          entering={FadeIn.delay(300)}
        >
          <ToiletMap style={styles.map} />
        </Animated.View>
        
        <Animated.View 
          entering={SlideInDown.delay(600)}
          style={styles.legend}
        >
          <ThemedText type="defaultSemiBold" style={styles.legendTitle}>
            🗺️ Légende
          </ThemedText>
          <View style={styles.legendGrid}>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#28A745' }]} />
              <ThemedText style={styles.legendText}>Sanitaires automatiques</ThemedText>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#007BFF' }]} />
              <ThemedText style={styles.legendText}>Urinoirs</ThemedText>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#FD7E14' }]} />
              <ThemedText style={styles.legendText}>Chalets de nécessité</ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 2,
    color: '#212529',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtext: {
    textAlign: 'center',
    color: '#212529',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '400',
  },
  mapContainer: {
    height: 400,
    margin: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  map: {
    flex: 1,
  },
  legend: {
    margin: 15,
    marginTop: 0,
    padding: 20,
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
    marginBottom: 100,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  legendTitle: {
    marginBottom: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  legendGrid: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
});
