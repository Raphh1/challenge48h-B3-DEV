import { StyleSheet, View } from 'react-native';
import { ToiletMap } from '@/components/ToiletMap';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerText}>
          🚻 Toilettes publiques de Bordeaux
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Trouvez les toilettes publiques les plus proches de vous
        </ThemedText>
      </ThemedView>
      
      <ToiletMap style={styles.map} />
      
      <ThemedView style={styles.legend}>
        <ThemedText type="defaultSemiBold" style={styles.legendTitle}>
          Légende:
        </ThemedText>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <ThemedText style={styles.legendText}>Sanitaires automatiques</ThemedText>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
          <ThemedText style={styles.legendText}>Urinoirs</ThemedText>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <ThemedText style={styles.legendText}>Chalets de nécessité</ThemedText>
        </View>
      </ThemedView>
    </View>
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
  headerText: {
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  map: {
    flex: 1,
  },
  legend: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendTitle: {
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});
