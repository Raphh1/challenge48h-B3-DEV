import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useToiletData } from '@/hooks/useToiletData';
import { ToiletDetail } from '@/components/ToiletDetail';
import { Toilet } from '@/types/Toilet';
import { getToiletColor } from '@/utils/toiletParser';

interface ToiletMapProps {
  style?: any;
}

export function ToiletMap({ style }: ToiletMapProps) {
  const { toilets, loading, error } = useToiletData();
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Bordeaux coordinates as default
  const bordeauxRegion = {
    latitude: 44.8378,
    longitude: -0.5792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'La permission de localisation est nécessaire pour centrer la carte sur votre position.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // You would use this to center the map on user's location
      // mapRef.current?.animateToRegion({
      //   latitude: location.coords.latitude,
      //   longitude: location.coords.longitude,
      //   latitudeDelta: 0.01,
      //   longitudeDelta: 0.01,
      // });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position.');
    }
  };

  const handleMarkerPress = (toilet: Toilet) => {
    setSelectedToilet(toilet);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedToilet(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, style, styles.centered]}>
        {/* You could add a loading spinner here */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style, styles.centered]}>
        {/* You could add an error message here */}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={bordeauxRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {toilets.map((toilet) => (
          <Marker
            key={toilet.gmlId}
            coordinate={{
              latitude: toilet.coordinates.latitude,
              longitude: toilet.coordinates.longitude,
            }}
            title={toilet.adresse}
            description={`${toilet.type.replace(/_/g, ' ')} - ${toilet.handi === 'OUI' ? 'Accessible PMR' : 'Non accessible PMR'}`}
            pinColor={getToiletColor(toilet.type)}
            onPress={() => handleMarkerPress(toilet)}
          />
        ))}
      </MapView>

      <ToiletDetail
        toilet={selectedToilet}
        visible={showDetail}
        onClose={handleCloseDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
