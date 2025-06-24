import { ThemedText } from '@/components/ThemedText';
import { Toilet } from '@/types/Toilet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface StarModalProps {
  toilet: Toilet | null;
  visible: boolean;
  onClose: () => void;
  onRatingSaved: (rating: number) => void;
}

export function StarModal({ toilet, visible, onClose, onRatingSaved }: StarModalProps) {
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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
      
      // Charger la note existante
      loadExistingRating();
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

  const loadExistingRating = async () => {
    if (!toilet) return;
    
    try {
      const ratingKey = `toilet_rating_${toilet.coordinates.latitude}_${toilet.coordinates.longitude}`;
      const existingRating = await AsyncStorage.getItem(ratingKey);
      if (existingRating) {
        setRating(parseInt(existingRating, 10));
      } else {
        setRating(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la note:', error);
    }
  };

  const saveRating = async () => {
    if (!toilet) return;
    
    setIsLoading(true);
    try {
      const ratingKey = `toilet_rating_${toilet.coordinates.latitude}_${toilet.coordinates.longitude}`;
      
      if (rating === 0) {
        // Supprimer la note si elle est à 0
        await AsyncStorage.removeItem(ratingKey);
      } else {
        // Sauvegarder la note
        await AsyncStorage.setItem(ratingKey, rating.toString());
      }
      
      onRatingSaved(rating);
      Alert.alert('Succès', 'Votre note a été sauvegardée !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarPress = (starNumber: number) => {
    setRating(starNumber);
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
        >
          <ThemedText style={[
            styles.star,
            { color: i <= rating ? '#FFD700' : '#E9ECEF' }
          ]}>
            ⭐
          </ThemedText>
        </Pressable>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Très mauvais';
      case 2: return 'Mauvais';
      case 3: return 'Correct';
      case 4: return 'Bon';
      case 5: return 'Excellent';
      default: return 'Aucune note';
    }
  };

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
                ⭐ Notation
              </ThemedText>
            </Animated.View>
          </View>

          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <ThemedText style={styles.subtitle}>
              Notez ces toilettes
            </ThemedText>
            
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>

            <ThemedText style={styles.ratingText}>
              {getRatingText()}
            </ThemedText>

            <ThemedText style={styles.instruction}>
              Appuyez sur une étoile pour noter
            </ThemedText>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={saveRating}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </ThemedText>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
            </Pressable>
          </View>
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
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#212529',
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    width: '100%',
    padding: 25,
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#495057',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 5,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 36,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
  },
  saveButtonText: {
    color: '#212529',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C757D',
  },
  cancelButtonText: {
    color: '#6C757D',
    fontWeight: '600',
    fontSize: 16,
  },
});
