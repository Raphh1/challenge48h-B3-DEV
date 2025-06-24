import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';
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
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
      });
      modalOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      contentTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      modalScale.value = withTiming(0.8, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      modalOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      contentTranslateY.value = withTiming(50, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!toilet) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Animated.View style={[styles.modalView, modalAnimatedStyle]}>
          <View style={styles.header}>
            <Animated.View style={contentAnimatedStyle}>
              <ThemedText style={styles.emoji}>
                {getToiletIcon(toilet.type)}
              </ThemedText>
              <ThemedText type="title" style={styles.title}>
                Toilettes publiques
              </ThemedText>
            </Animated.View>
          </View>

          <Animated.View style={[styles.infoContainer, contentAnimatedStyle]}>
            <ThemedText type="subtitle" style={styles.address}>
              📍 {toilet.adresse}
            </ThemedText>

            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Type:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {toilet.type.replace(/_/g, ' ')}
                </ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Accessible PMR:</ThemedText>
                <ThemedText style={[
                  styles.detailValue,
                  styles.accessibilityBadge,
                  { 
                    backgroundColor: toilet.handi === 'OUI' ? '#E8F5E8' : '#FFEBEE',
                    color: toilet.handi === 'OUI' ? '#2E7D32' : '#C62828' 
                  }
                ]}>
                  {toilet.handi === 'OUI' ? '♿ Oui' : '❌ Non'}
                </ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Coordonnées:</ThemedText>
                <ThemedText style={styles.coordinates}>
                  {toilet.coordinates.latitude.toFixed(6)}, {toilet.coordinates.longitude.toFixed(6)}
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <ThemedText style={styles.closeButtonText}>Fermer</ThemedText>
          </Pressable>
        </Animated.View>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    maxWidth: '90%',
    width: 380,
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    color: '#212529',
    fontSize: 24,
    fontWeight: '700',
  },
  infoContainer: {
    width: '100%',
    padding: 25,
  },
  address: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
  },
  detailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
    gap: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 15,
    fontSize: 15,
    fontWeight: '500',
    color: '#6C757D',
  },
  accessibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  coordinates: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    marginLeft: 15,
    fontFamily: 'monospace',
    color: '#ADB5BD',
  },
  closeButton: {
    width: '100%',
    backgroundColor: '#212529',
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});
