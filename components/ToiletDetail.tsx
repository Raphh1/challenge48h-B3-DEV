import { RemarkModal } from '@/components/RemarkModal';
import { StarModal } from '@/components/StarModal';
import { ThemedText } from '@/components/ThemedText';
import { Toilet } from '@/types/Toilet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface ToiletDetailProps {
  toilet: Toilet | null;
  visible: boolean;
  onClose: () => void;
}

export function ToiletDetail({ toilet, visible, onClose }: ToiletDetailProps) {
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [starModalVisible, setStarModalVisible] = useState(false);
  const [currentRemark, setCurrentRemark] = useState<string>('');
  const [currentRating, setCurrentRating] = useState<number>(0);

  const openMaps = () => {
    if (!toilet) return;
    
    const { latitude, longitude } = toilet.coordinates;
    
    // Construire l'URL en fonction de la plateforme - utilisation directe des coordonnées
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${latitude},${longitude}&ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}&z=16`,
      default: `https://www.google.com/maps?q=${latitude},${longitude}&z=16`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error('Erreur lors de l\'ouverture de Maps:', err);
        // Fallback universel vers Google Maps web avec coordonnées exactes
        const fallbackUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16`;
        Linking.openURL(fallbackUrl).catch((fallbackErr) => {
          console.error('Erreur fallback Maps:', fallbackErr);
        });
      });
    }
  };

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
      
      // Charger la remarque existante
      loadRemark();
      loadRating();
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

  const loadRemark = async () => {
    if (!toilet) return;
    
    try {
      const remarkKey = `toilet_remark_${toilet.coordinates.latitude}_${toilet.coordinates.longitude}`;
      const remark = await AsyncStorage.getItem(remarkKey);
      setCurrentRemark(remark || '');
    } catch (error) {
      console.error('Erreur lors du chargement de la remarque:', error);
    }
  };

  const loadRating = async () => {
    if (!toilet) return;
    
    try {
      const ratingKey = `toilet_rating_${toilet.coordinates.latitude}_${toilet.coordinates.longitude}`;
      const rating = await AsyncStorage.getItem(ratingKey);
      setCurrentRating(rating ? parseInt(rating, 10) : 0);
    } catch (error) {
      console.error('Erreur lors du chargement de la note:', error);
    }
  };

  const handleRemarkSaved = (remark: string) => {
    setCurrentRemark(remark);
  };

  const handleRatingSaved = (rating: number) => {
    setCurrentRating(rating);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <ThemedText
          key={i}
          style={[
            styles.displayStar,
            { color: i <= rating ? '#FFD700' : '#E9ECEF' }
          ]}
        >
          ⭐
        </ThemedText>
      );
    }
    return stars;
  };

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
            <Animated.View style={[styles.headerContent, contentAnimatedStyle]}>
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

            {currentRemark && (
              <View style={styles.remarkContainer}>
                <ThemedText type="defaultSemiBold" style={styles.remarkLabel}>
                  📝 Votre remarque:
                </ThemedText>
                <View style={styles.remarkCard}>
                  <ThemedText style={styles.remarkText}>{currentRemark}</ThemedText>
                </View>
              </View>
            )}

            {currentRating > 0 && (
              <View style={styles.ratingContainer}>
                <ThemedText type="defaultSemiBold" style={styles.ratingLabel}>
                  ⭐ Votre note:
                </ThemedText>
                <View style={styles.ratingDisplay}>
                  {renderStars(currentRating)}
                  <ThemedText style={styles.ratingText}>
                    ({currentRating}/5)
                  </ThemedText>
                </View>
              </View>
            )}
          </Animated.View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.routeButton}
              onPress={openMaps}
            >
              <ThemedText style={styles.routeButtonText}>🚗 Prendre la route</ThemedText>
            </Pressable>

            <Pressable
              style={styles.remarkButton}
              onPress={() => setRemarkModalVisible(true)}
            >
              <ThemedText style={styles.remarkButtonText}>
                📝 {currentRemark ? 'Modifier la remarque' : 'Ajouter une remarque'}
              </ThemedText>
            </Pressable>

            <Pressable
              style={styles.starButton}
              onPress={() => setStarModalVisible(true)}
            >
              <ThemedText style={styles.starButtonText}>
                ⭐ {currentRating > 0 ? 'Modifier la note' : 'Noter ces toilettes'}
              </ThemedText>
            </Pressable>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <ThemedText style={styles.closeButtonText}>Fermer</ThemedText>
          </Pressable>
        </Animated.View>
      </View>

      <RemarkModal
        toilet={toilet}
        visible={remarkModalVisible}
        onClose={() => setRemarkModalVisible(false)}
        onRemarkSaved={handleRemarkSaved}
      />

      <StarModal
        toilet={toilet}
        visible={starModalVisible}
        onClose={() => setStarModalVisible(false)}
        onRatingSaved={handleRatingSaved}
      />
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
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    paddingVertical: 35,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 5,
  },
  emoji: {
    fontSize: 32,
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
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  routeButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  routeButtonText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
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
  remarkContainer: {
    marginTop: 20,
  },
  remarkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  remarkCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  remarkText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  remarkButton: {
    width: '100%',
    backgroundColor: '#28A745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  remarkButtonText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  ratingContainer: {
    marginTop: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  displayStar: {
    fontSize: 24,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 10,
  },
  starButton: {
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  starButtonText: {
    color: '#212529',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});
