const API_BASE_URL = 'https://datahub.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/bor_associations/records';

export const fetchAssociations = async (query?: string): Promise<any> => {
  const params = new URLSearchParams({
    limit: '100',
  });

  if (query) {
    // Recherche dans le nom, les activités et la description
    params.append('where', `nom like "%${query}%" or liste_activites like "%${query}%" or description like "%${query}%"`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('API Response:', data);
    console.log('Total records:', data.total_count);
    
    return data;
  } catch (error) {
    console.error('Error fetching associations:', error);
    throw error;
  }
};

// Service de géocodage pour convertir les adresses en coordonnées
export const geocodeAddress = async (address: string, city: string, postalCode: string): Promise<[number, number] | null> => {
  const fullAddress = `${address}, ${postalCode} ${city}, France`;
  
  try {
    // Ajouter un délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=fr`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      // Vérifier que les coordonnées sont dans la région de Bordeaux
      if (lat >= 44.5 && lat <= 45.0 && lon >= -1.0 && lon <= -0.2) {
        return [lat, lon];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};