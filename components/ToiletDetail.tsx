import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Toilet } from '@/types/Toilet';
import { getToiletIcon } from '@/utils/toiletParser';

interface ToiletDetailProps {
  toilet: Toilet | null;
  visible: boolean;
  onClose: () => void;
}

export function ToiletDetail({ toilet, visible, onClose }: ToiletDetailProps) {
  if (!toilet) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <View style={styles.header}>
            <ThemedText style={styles.emoji}>
              {getToiletIcon(toilet.type)}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Toilettes publiques
            </ThemedText>
          </View>

          <View style={styles.infoContainer}>
            <ThemedText type="subtitle" style={styles.address}>
              📍 {toilet.adresse}
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">Type:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {toilet.type.replace(/_/g, ' ')}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">Accessible PMR:</ThemedText>
              <ThemedText style={[
                styles.detailValue,
                { color: toilet.handi === 'OUI' ? '#4CAF50' : '#FF5722' }
              ]}>
                {toilet.handi === 'OUI' ? '♿ Oui' : '❌ Non'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">Coordonnées:</ThemedText>
              <ThemedText style={styles.coordinates}>
                {toilet.coordinates.latitude.toFixed(6)}, {toilet.coordinates.longitude.toFixed(6)}
              </ThemedText>
            </View>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <ThemedText style={styles.closeButtonText}>Fermer</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: '90%',
    width: 350,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  address: {
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  coordinates: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
