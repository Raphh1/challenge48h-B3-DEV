import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import InteractiveMap from './components/InteractiveMap';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { Association } from './types/association';
import { fetchAssociations, geocodeAddress } from './services/associationsApi';

function App() {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [geocodingStatus, setGeocodingStatus] = useState('');

  const loadAssociations = async () => {
    setLoading(true);
    setError(null);
    setGeocodingProgress(0);
    setGeocodingStatus('Chargement des associations...');
    
    try {
      const data = await fetchAssociations();
      const associationsData = data.results;
      
      setGeocodingStatus('Géolocalisation des associations...');
      
      // Filtrer les associations avec des adresses valides
      const associationsToGeocode = associationsData.filter(assoc => 
        assoc.contact_adresse && assoc.contact_ville && assoc.contact_cp
      );
      
      console.log(`${associationsToGeocode.length} associations à géocoder sur ${associationsData.length} total`);
      
      // Géocoder les adresses en lots plus petits pour éviter de surcharger l'API
      const associationsWithCoords: Association[] = [];
      const batchSize = 3; // Réduire la taille des lots
      let geocodedCount = 0;
      
      for (let i = 0; i < associationsToGeocode.length; i += batchSize) {
        const batch = associationsToGeocode.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (association) => {
          try {
            const coords = await geocodeAddress(
              association.contact_adresse!,
              association.contact_ville!,
              association.contact_cp!
            );
            
            if (coords) {
              geocodedCount++;
              return { ...association, coordinates: coords };
            }
            return association;
          } catch (error) {
            console.error(`Geocoding failed for ${association.nom}:`, error);
            return association;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        associationsWithCoords.push(...batchResults);
        
        // Mettre à jour le progrès
        const progress = (associationsWithCoords.length / associationsToGeocode.length) * 100;
        setGeocodingProgress(Math.min(100, progress));
        setGeocodingStatus(`Géolocalisées: ${geocodedCount}/${associationsToGeocode.length}`);
        
        // Pause plus longue pour éviter de surcharger l'API
        if (i + batchSize < associationsToGeocode.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Ajouter les associations sans adresse
      const associationsWithoutAddress = associationsData.filter(assoc => 
        !assoc.contact_adresse || !assoc.contact_ville || !assoc.contact_cp
      );
      
      const finalAssociations = [...associationsWithCoords, ...associationsWithoutAddress];
      
      console.log(`Géocodage terminé: ${geocodedCount} associations géolocalisées`);
      setAssociations(finalAssociations);
      
    } catch (err) {
      setError('Erreur lors du chargement des associations. Vérifiez votre connexion internet.');
      console.error('Error loading associations:', err);
    } finally {
      setLoading(false);
      setGeocodingProgress(0);
      setGeocodingStatus('');
    }
  };

  useEffect(() => {
    loadAssociations();
  }, []);

  // Filter associations based on search query
  const filteredAssociations = useMemo(() => {
    if (!searchQuery.trim()) {
      return associations;
    }

    const query = searchQuery.toLowerCase().trim();
    return associations.filter((association) => {
      return (
        association.nom?.toLowerCase().includes(query) ||
        association.liste_activites?.some(activite => 
          activite.toLowerCase().includes(query)
        ) ||
        association.contact_ville?.toLowerCase().includes(query) ||
        association.description?.toLowerCase().includes(query) ||
        association.sigle?.toLowerCase().includes(query)
      );
    });
  }, [associations, searchQuery]);

  const handleRetry = () => {
    loadAssociations();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        associationsCount={filteredAssociations.length}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-[calc(100vh-200px)] min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner />
              {geocodingProgress > 0 && (
                <div className="mt-4 w-80">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-bordeaux h-3 rounded-full transition-all duration-300"
                      style={{ width: `${geocodingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {geocodingStatus}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(geocodingProgress)}% terminé
                  </p>
                </div>
              )}
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : (
            <InteractiveMap associations={filteredAssociations} />
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-600 text-center">
            Données fournies par{' '}
            <a
              href="https://datahub.bordeaux-metropole.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bordeaux hover:underline"
            >
              Bordeaux Métropole Open Data
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;