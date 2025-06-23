import { useState, useEffect, useMemo } from 'react';
import { Association } from '../types/association';
import { fetchAssociations, geocodeAddressesBatch, preloadAssociations } from '../services/associationsApi';

export const useAssociations = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [geocodingStatus, setGeocodingStatus] = useState('');
  const [performanceStats, setPerformanceStats] = useState({
    loadingTime: 0,
    cacheHit: false,
    geocodedCount: 0
  });

  const loadAssociations = async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);
    setGeocodingProgress(0);
    setGeocodingStatus('Chargement des associations...');
    
    try {
      const data = await fetchAssociations();
      const loadingTime = Math.round((Date.now() - startTime) / 1000);
      
      // Vérifier si les données viennent du cache (chargement < 1 seconde)
      const cacheHit = loadingTime < 1;
      
      const associationsData = data.results;
      
      setGeocodingStatus('Géolocalisation des associations...');
      
      // Filtrer les associations avec des adresses valides
      const associationsToGeocode = associationsData.filter((assoc: any) => 
        assoc.contact_adresse && assoc.contact_ville && assoc.contact_cp
      );
      
      console.log(`${associationsToGeocode.length} associations à géocoder sur ${associationsData.length} total`);
      
      // Utiliser la nouvelle fonction batch pour géocoder plus efficacement
      const addressesToGeocode = associationsToGeocode.map((assoc: any) => ({
        id: assoc.id || assoc.nom,
        address: assoc.contact_adresse!,
        city: assoc.contact_ville!,
        postalCode: assoc.contact_cp!
      }));
      
      // Géocoder par batch avec la nouvelle fonction optimisée
      const geocodeResults = await geocodeAddressesBatch(addressesToGeocode);
      
      // Appliquer les coordonnées aux associations
      const associationsWithCoords: Association[] = associationsData.map((association: any) => {
        const key = association.id || association.nom;
        const coords = geocodeResults.get(key);
        
        if (coords) {
          return { ...association, coordinates: coords };
        }
        return association;
      });
      
      const geocodedCount = Array.from(geocodeResults.values()).filter(coord => coord !== null).length;
      console.log(`Géocodage terminé: ${geocodedCount} associations géolocalisées`);
      
      setAssociations(associationsWithCoords);
      setGeocodingProgress(100);
      setGeocodingStatus(`Terminé: ${geocodedCount}/${associationsToGeocode.length} géolocalisées`);
      
      // Mettre à jour les statistiques de performance
      setPerformanceStats({
        loadingTime,
        cacheHit,
        geocodedCount
      });
      
    } catch (err) {
      setError('Erreur lors du chargement des associations. Vérifiez votre connexion internet.');
      console.error('Error loading associations:', err);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setGeocodingProgress(0);
        setGeocodingStatus('');
      }, 2000);
    }
  };

  useEffect(() => {
    // Pre-charger les associations en arrière-plan
    preloadAssociations();
    loadAssociations();
  }, []);

  const retry = () => {
    loadAssociations();
  };

  return {
    associations,
    loading,
    error,
    geocodingProgress,
    geocodingStatus,
    performanceStats,
    retry
  };
};

export const useFilteredAssociations = (associations: Association[], searchQuery: string) => {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return associations;
    }

    const query = searchQuery.toLowerCase().trim();
    return associations.filter((association) => {
      return (
        association.nom?.toLowerCase().includes(query) ||
        association.liste_activites?.some((activite: string) => 
          activite.toLowerCase().includes(query)
        ) ||
        association.contact_ville?.toLowerCase().includes(query) ||
        association.description?.toLowerCase().includes(query) ||
        association.sigle?.toLowerCase().includes(query)
      );
    });
  }, [associations, searchQuery]);
};
