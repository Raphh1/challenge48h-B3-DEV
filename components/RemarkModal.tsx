import { ThemedText } from '@/components/ThemedText';
import { Toilet } from '@/types/Toilet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface RemarkModalProps {
  toilet: Toilet | null;
  visible: boolean;
  onClose: () => void;
  onRemarkSaved: (remark: string) => void;
}

export function RemarkModal({ toilet, visible, onClose, onRemarkSaved }: RemarkModalProps) {
  const [remark, setRemark] = useState('');
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
      
      // Charger la remarque existante
      loadExistingRemark();
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

  const loadExistingRemark = async () => {
    if (!toilet) return;
    
    try {
      const remarkKey = `toilet_remark_${toilet.coordinates.latitude}_${toilet.coordinates.longitude}`;
      const existingRemark = await AsyncStorage.getItem(remarkKey);
      if (existingRemark) {
        setRemark(existingRemark);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la remarque:', error);
    }
  };

  const saveRemark = async () => {
    if (!toilet) return;
    
    setIsLoading(true);
    try {
      const remarkKey = `toilet_remark_${toilet.coordinates.latitude}_${toilet.coordinates.longitude}`;
      
      if (remark.trim() === '') {
        // Supprimer la remarque si elle est vide
        await AsyncStorage.removeItem(remarkKey);
      } else {
        // Sauvegarder la remarque
        await AsyncStorage.setItem(remarkKey, remark.trim());
      }
      
      onRemarkSaved(remark.trim());
      Alert.alert('Succès', 'Votre remarque a été sauvegardée !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre remarque');
    } finally {
      setIsLoading(false);
    }
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
                📝 Remarques
              </ThemedText>
            </Animated.View>
          </View>

          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <ThemedText style={styles.subtitle}>
              Ajoutez une remarque pour ces toilettes
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={remark}
                onChangeText={setRemark}
                placeholder="Écrivez votre remarque ici..."
                placeholderTextColor="#ADB5BD"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <ThemedText style={styles.characterCount}>
                {remark.length}/500
              </ThemedText>
            </View>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={saveRemark}
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
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#495057',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 120,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 12,
    color: '#ADB5BD',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#28A745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
  },
  saveButtonText: {
    color: 'white',
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
